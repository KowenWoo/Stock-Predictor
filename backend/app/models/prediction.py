from pydantic import BaseModel
from typing import List


class PredictionPoint(BaseModel):
    date: str
    price: float


class PredictionResponse(BaseModel):
    symbol: str
    predictions: List[PredictionPoint]
    start_date: str
    end_date: str
