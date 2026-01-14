from fastapi import APIRouter, HTTPException

from app.models import PredictionPoint, PredictionResponse
from app.services import predict_stock

router = APIRouter()


@router.post("/predictions/{symbol}", response_model=PredictionResponse)
async def get_predictions(symbol: str):
    """
    Generate stock price predictions using the LSTM model.

    Currently only supports AAPL.
    Returns 50 days of predicted prices.
    """
    try:
        predictions = predict_stock(symbol)

        prediction_points = [
            PredictionPoint(date=date, price=price)
            for date, price in predictions
        ]

        return PredictionResponse(
            symbol=symbol.upper(),
            predictions=prediction_points,
            start_date=predictions[0][0],
            end_date=predictions[-1][0]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
