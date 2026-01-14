from fastapi import APIRouter, HTTPException

from app.services import fetch_and_update_stock_data, get_stock_data_info

router = APIRouter()


@router.get("/stocks/available")
async def get_available_stocks():
    """Get list of available stocks for prediction."""
    return {"stocks": ["AAPL"]}


@router.get("/stocks/data/{symbol}")
async def get_stock_data(symbol: str):
    """Get info about stored stock data for a symbol."""
    try:
        info = get_stock_data_info(symbol)
        return info
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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
