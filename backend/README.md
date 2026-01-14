# Stock Predictor Backend

FastAPI-based backend service for stock price prediction using LSTM neural networks.

## Features

- LSTM model for 50-day stock price predictions
- Real-time data fetching from Alpha Vantage API
- Historical data management with CSV storage
- Automatic data appending (preserves historical data)
- Fast async API with FastAPI

## Requirements

- Python 3.11 or 3.12 (Python 3.13+ may have compatibility issues with TensorFlow)
- Alpha Vantage API key (free tier available)

## Setup

### 1. Install Python 3.12

```bash
# macOS
brew install python@3.12

# Verify installation
python3.12 --version
```

### 2. Create Virtual Environment

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
ALPHA_VANTAGE_API_KEY="your_api_key_here"
```

Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key).

### 5. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### Health Check

```bash
GET /api/health
```

Returns server status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "app_name": "StockVision API",
  "version": "1.0.0",
  "models_loaded": false
}
```

---

### Get Available Stocks

```bash
GET /api/stocks/available
```

Returns list of supported stock symbols.

**Response:**
```json
{
  "stocks": ["AAPL"]
}
```

---

### Get Stock Data Info

```bash
GET /api/stocks/data/{symbol}
```

Returns information about stored historical data for a symbol.

**Example:**
```bash
curl http://localhost:8000/api/stocks/data/AAPL
```

**Response:**
```json
{
  "symbol": "AAPL",
  "exists": true,
  "latest_date": "2025-01-13",
  "oldest_date": "2015-01-02",
  "total_records": 6250,
  "csv_path": "/path/to/lstm/stock_market_data-AAPL.csv"
}
```

---

### Update Stock Data

```bash
POST /api/stocks/update/{symbol}
```

Fetches latest stock data from Alpha Vantage and appends to CSV.

**Example:**
```bash
curl -X POST http://localhost:8000/api/stocks/update/AAPL
```

**Response:**
```json
{
  "message": "Stock data updated successfully",
  "symbol": "AAPL",
  "latest_date": "2025-01-13",
  "new_records_added": 5,
  "total_records": 6255,
  "csv_path": "/path/to/lstm/stock_market_data-AAPL.csv",
  "updated_at": "2025-01-13T10:30:00"
}
```

**Note:** Alpha Vantage free tier has a **25 requests/day** limit. Use sparingly.

---

### Get Stock Predictions

```bash
POST /api/predictions/{symbol}
```

Generates 50-day price predictions using the LSTM model.

**Example:**
```bash
curl -X POST http://localhost:8000/api/predictions/AAPL
```

**Response:**
```json
{
  "symbol": "AAPL",
  "start_date": "2025-01-14",
  "end_date": "2025-03-04",
  "predictions": [
    {
      "date": "2025-01-14",
      "price": 235.67
    },
    {
      "date": "2025-01-15",
      "price": 236.42
    },
    ...
  ]
}
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   └── config.py        # Configuration settings
│   ├── routers/
│   │   ├── predictions.py   # Prediction endpoints
│   │   └── stocks.py        # Stock data endpoints
│   ├── models/
│   │   └── prediction.py    # Pydantic models
│   └── services/
│       ├── prediction_service.py    # LSTM prediction logic
│       └── stock_data_service.py    # Data fetching/management
├── lstm/
│   ├── lstm_model.h5        # Pre-trained LSTM model
│   ├── scaler.joblib        # Data scaler
│   └── stock_market_data-AAPL.csv  # Historical data
├── requirements.txt
├── .env
└── README.md
```

## Typical Workflow

1. **Update data with latest prices:**
   ```bash
   curl -X POST http://localhost:8000/api/stocks/update/AAPL
   ```

2. **Get predictions:**
   ```bash
   curl -X POST http://localhost:8000/api/predictions/AAPL
   ```

3. **Check data freshness:**
   ```bash
   curl http://localhost:8000/api/stocks/data/AAPL
   ```

## API Rate Limits

- **Alpha Vantage Free Tier:**
  - 25 requests/day
  - 5 requests/minute

- **Recommendation:** Update data once per day, cache predictions

## Development

### Running Tests

```bash
# TODO: Add test set
pytest
```

### Code Formatting

```bash
# Format code
black app/

# Lint code
flake8 app/
```

## Troubleshooting

### TensorFlow Installation Issues

If you encounter errors installing TensorFlow:
- Ensure you're using Python 3.11 or 3.12
- Python 3.13+ is not yet fully supported by TensorFlow

### scikit-learn OpenMP Errors on macOS

If scikit-learn fails to build:
```bash
# Use Python 3.12 instead of 3.14
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Alpha Vantage API Key Errors

Make sure your `.env` file has:
```
ALPHA_VANTAGE_API_KEY="your_key_here"
```

Not:
```
ALPHA_VANTAGE_API="your_key_here"  # Wrong!
```

## Future Enhancements

- [ ] Support for multiple stock symbols
- [ ] Model retraining endpoint
- [ ] MongoDB integration for caching
- [ ] Confidence intervals for predictions
- [ ] Real-time WebSocket updates
- [ ] Authentication & rate limiting

## License

MIT
