import os
import pandas as pd
from alpha_vantage.timeseries import TimeSeries
from datetime import datetime

from app.core.config import settings

# Path to store stock data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LSTM_DIR = os.path.join(BASE_DIR, "lstm")


def get_csv_path(symbol: str) -> str:
    """Get the CSV file path for a symbol."""
    return os.path.join(LSTM_DIR, f"stock_market_data-{symbol.upper()}.csv")


def fetch_and_update_stock_data(symbol: str = "AAPL") -> dict:
    """
    Fetch the latest stock data from Alpha Vantage and append to existing CSV.

    - If CSV exists: appends only new dates (preserves historical data)
    - If CSV doesn't exist: creates new file with compact data (~100 days)

    Returns:
        dict with status info including latest date and number of records
    """
    # Allow any symbol (note: LSTM model was trained on AAPL, predictions may be less accurate for other stocks)
    symbol = symbol.upper()

    api_key = settings.alpha_vantage_api_key
    if not api_key:
        raise ValueError("Alpha Vantage API key not configured")

    # Fetch data from Alpha Vantage (compact = last 100 data points)
    ts = TimeSeries(key=api_key, output_format='pandas')
    new_data, meta_data = ts.get_daily(symbol=symbol, outputsize='compact')

    # Rename columns to match expected format
    new_data = new_data.rename(columns={
        '1. open': '1. open',
        '2. high': '2. high',
        '3. low': '3. low',
        '4. close': 'Close',
        '5. volume': '5. volume'
    })

    # Reset index to make date a column
    new_data = new_data.reset_index()
    new_data = new_data.rename(columns={'index': 'date'})
    new_data['date'] = pd.to_datetime(new_data['date'])

    csv_path = get_csv_path(symbol)
    new_records = 0

    # Check if existing CSV exists
    if os.path.exists(csv_path):
        # Load existing data
        existing_data = pd.read_csv(csv_path)
        existing_data['date'] = pd.to_datetime(existing_data['date'])

        # Find dates that are in new_data but not in existing_data
        existing_dates = set(existing_data['date'])
        new_rows = new_data[~new_data['date'].isin(existing_dates)]
        new_records = len(new_rows)

        if new_records > 0:
            # Append new rows to existing data
            combined_data = pd.concat([existing_data, new_rows], ignore_index=True)
            combined_data = combined_data.sort_values('date', ascending=False)
            combined_data.to_csv(csv_path, index=False)
            final_data = combined_data
        else:
            final_data = existing_data
    else:
        # No existing file - save new data as-is
        new_data = new_data.sort_values('date', ascending=False)
        new_data.to_csv(csv_path, index=False)
        final_data = new_data
        new_records = len(new_data)

    # Get info for response
    final_data = final_data.sort_values('date', ascending=False)
    latest_date = final_data.iloc[0]['date']
    if isinstance(latest_date, pd.Timestamp):
        latest_date = latest_date.strftime("%Y-%m-%d")

    return {
        "symbol": symbol.upper(),
        "latest_date": latest_date,
        "new_records_added": new_records,
        "total_records": len(final_data),
        "csv_path": csv_path,
        "updated_at": datetime.now().isoformat()
    }


def get_stock_data_info(symbol: str = "AAPL") -> dict:
    """
    Get info about the current stock data CSV.

    Returns:
        dict with info about the stored data
    """
    csv_path = get_csv_path(symbol)

    if not os.path.exists(csv_path):
        return {
            "symbol": symbol.upper(),
            "exists": False,
            "message": "No data file found. Call update endpoint to fetch data."
        }

    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date', ascending=False)

    latest_date = df.iloc[0]['date'].strftime("%Y-%m-%d")
    oldest_date = df.iloc[-1]['date'].strftime("%Y-%m-%d")

    return {
        "symbol": symbol.upper(),
        "exists": True,
        "latest_date": latest_date,
        "oldest_date": oldest_date,
        "total_records": len(df),
        "csv_path": csv_path
    }


def get_historical_prices(symbol: str = "AAPL", days: int = 365) -> dict:
    """
    Get historical closing prices from the CSV file.

    Args:
        symbol: Stock symbol
        days: Number of recent days to return

    Returns:
        dict with symbol and list of {date, price} objects
    """
    csv_path = get_csv_path(symbol)

    if not os.path.exists(csv_path):
        raise ValueError(f"No data file found for {symbol}. Call update endpoint first.")

    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date', ascending=False)

    # Get last N days
    recent_data = df.head(days)

    # Format as list of {date, price}
    prices = [
        {
            "date": row['date'].strftime("%Y-%m-%d"),
            "price": float(row['Close'])
        }
        for _, row in recent_data.iterrows()
    ]

    # Sort by date ascending (oldest first)
    prices.reverse()

    return {
        "symbol": symbol.upper(),
        "prices": prices,
        "total_records": len(prices)
    }
