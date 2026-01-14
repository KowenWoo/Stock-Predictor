import os
import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime, timedelta
from joblib import load
from typing import List, Tuple

# Get the base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LSTM_DIR = os.path.join(BASE_DIR, "lstm")
MODEL_PATH = os.path.join(LSTM_DIR, "lstm_model.h5")
SCALER_PATH = os.path.join(LSTM_DIR, "scaler.joblib")
CSV_PATH = os.path.join(LSTM_DIR, "stock_market_data-AAPL.csv")

# Global model and scaler (loaded once)
_model = None
_scaler = None


def load_model():
    """Load the LSTM model and scaler if not already loaded."""
    global _model, _scaler

    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH)

    if _scaler is None:
        _scaler = load(SCALER_PATH)

    return _model, _scaler


def get_recent_prices(symbol: str, window_size: int = 50) -> Tuple[str, List[float]]:
    """
    Get the most recent closing prices from the CSV file.
    Returns: (most_recent_date, list_of_prices)
    """
    # For MVP, we only support AAPL
    if symbol.upper() != "AAPL":
        raise ValueError(f"Symbol {symbol} not supported. Only AAPL is available.")

    df = pd.read_csv(CSV_PATH)

    # Sort by date descending to get most recent first
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date', ascending=False)

    # Get the most recent date and prices
    most_recent_date = df.iloc[0]['date'].strftime("%Y-%m-%d")
    prices = df['Close'].head(window_size).tolist()

    return most_recent_date, prices


def preprocess_data(prices: List[float]) -> np.ndarray:
    """Reshape price data for model input."""
    return np.array(prices).reshape(-1, 1)


def append_new_point(existing_array: np.ndarray, new_point: np.ndarray) -> np.ndarray:
    """
    Append a new data point while maintaining sliding window structure.
    Removes oldest point and adds new point at the end.
    """
    updated_array = existing_array[1:]
    new_point_array = np.array(new_point)
    return np.concatenate((updated_array, new_point_array), axis=0)


def generate_date_range(start_date: str, num_days: int) -> List[str]:
    """Generate a list of dates starting from start_date."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    return [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(1, num_days + 1)]


def predict_stock(symbol: str, prediction_days: int = 50) -> List[Tuple[str, float]]:
    """
    Generate stock price predictions for the given symbol.

    Returns: List of (date, predicted_price) tuples
    """
    model, scaler = load_model()

    # Get recent price data
    start_date, prices = get_recent_prices(symbol)

    # Preprocess and scale the data
    data = preprocess_data(prices)
    data = scaler.transform(data)

    # Make predictions using sliding window
    for _ in range(prediction_days):
        # Reshape for model: (1, window_size, 1)
        model_input = data.reshape(1, -1, 1)

        # Predict next point
        prediction = model.predict(model_input, verbose=0)[0][0]

        # Append to data (scaled version for next prediction)
        data = append_new_point(data, np.array([[prediction]]))

    # Generate dates for predictions
    dates = generate_date_range(start_date, prediction_days)

    # Extract the predicted values (last prediction_days points)
    # Inverse transform all at once
    predicted_scaled = data[-prediction_days:]
    predicted_prices = scaler.inverse_transform(predicted_scaled).flatten()

    # Combine dates and prices
    predictions = [(date, float(price)) for date, price in zip(dates, predicted_prices)]

    return predictions
