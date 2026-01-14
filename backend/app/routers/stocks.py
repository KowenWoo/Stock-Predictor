from fastapi import APIRouter, HTTPException, Query

from app.services import fetch_and_update_stock_data, get_stock_data_info, get_historical_prices

router = APIRouter()


@router.get("/stocks/available")
async def get_available_stocks():
    """Get list of available stocks for prediction."""
    return {"stocks": ["AAPL", "AMZN", "NVDA"]}


@router.get("/stocks/data/{symbol}")
async def get_stock_data(symbol: str):
    """Get info about stored stock data for a symbol."""
    try:
        info = get_stock_data_info(symbol)
        return info
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stocks/history/{symbol}")
async def get_stock_history(symbol: str, days: int = Query(default=365, ge=1, le=5000)):
    """
    Get historical closing prices for a symbol.

    Returns the last N days of historical data from the CSV.
    """
    try:
        history = get_historical_prices(symbol, days)
        return history
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")


@router.post("/stocks/update/{symbol}")
async def update_stock_data(symbol: str):
    """
    Fetch latest stock data from Alpha Vantage and update the CSV.

    This overwrites the existing data file with fresh data.
    Note: Alpha Vantage free tier has a limit of 25 requests/day.
    """
    try:
        result = fetch_and_update_stock_data(symbol)
        return {
            "message": "Stock data updated successfully",
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update stock data: {str(e)}")
