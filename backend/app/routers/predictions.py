from fastapi import APIRouter

router = APIRouter()


@router.post("/predictions/{symbol}")
async def predict_stock(symbol: str):
    """Generate predictions - placeholder for now"""
    return {
        "symbol": symbol,
        "message": "LSTM model integration coming in MILESTONE 3"
    }