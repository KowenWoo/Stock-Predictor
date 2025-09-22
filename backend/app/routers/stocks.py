from fastapi import APIRouter

router = APIRouter()


@router.get("/stocks/available")
async def get_available_stocks():
    """Get list of available stocks"""
    return {"stocks": ["AAPL"]}


@router.get("/stocks/data/{symbol}")
async def get_stock_data(symbol: str):
    """Get stock data - placeholder for now"""
    return {
        "symbol": symbol,
        "message": "Alpha Vantage integration coming in MILESTONE 2"
    }