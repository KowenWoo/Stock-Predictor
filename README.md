# Stockvision.ai
Developing a responsive web application that visualizes stock price predictions using a temporal convolutional network. The platform delivers an intuitive interface for viewing historical data alongside predicted future performance for selected stocks.

## Tech Stack
Current Technology Stack:
- Frontend: React with TailwindCSS for responsive, clean UI design
- Data Visualization: Recharts integration for interactive stock price charts
- Backend: Temporal Convolutional Network model for price predictions, FastAPI for API
- Deployment: Frontend to be hosted on GitHub Pages with separate backend deployment

## Current Development
Implementing a core visualization interface for three major tech stocks (AAPL, NVDA, AMZN) with focus on responsive design and smooth data interactions. The application enables users to switch between stocks and view both historical performance and predicted future trends.

AI backend: LSTM model with winow size 50, achieved 
- RMSE = 5.330939712652679
- MAPE = 21.487618635364495


## Installation and Setup

### Requirements
`cd backend
mkdir -p .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt`

cd frontend
`npm install`

### Run the backend:
`cd backend
uvicorn app.main:app --reload`

### Run the frontend:
`cd frontend
npm run dev`

## Remaining Improvements
- Cache the model results
- Add more stocks
- Add more features
- Add more visualizations
- Add more data



