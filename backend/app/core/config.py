from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_name: str = "StockVision API"
    version: str = "1.0.0"
    debug: bool = True

    # API Keys
    alpha_vantage_api_key: str = ""
    mongodb_uri: str = ""

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()