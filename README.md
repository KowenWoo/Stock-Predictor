# Stockvision.ai
Developing a responsive web application that visualizes stock price predictions using a temporal convolutional network. The platform delivers an intuitive interface for viewing historical data alongside predicted future performance for selected stocks.

## Tech Stack
Current Technology Stack:
- Frontend: React with TailwindCSS for responsive, clean UI design
- Data Visualization: Chart.js integration for interactive stock price charts
- Backend: Temporal Convolutional Network model for price predictions
- Deployment: Frontend to be hosted on GitHub Pages with separate backend deployment

## Current Development
Implementing a core visualization interface for three major tech stocks (AAPL, NVDA, AMZN) with focus on responsive design and smooth data interactions. The application enables users to switch between stocks and view both historical performance and predicted future trends.

AI backend: TCN with residual blocks (convolutional layer, ReLu, Dropout, Normalization). Data is structured into time series dataloader with sequence length 20, input length 1.


## Future Plans
- Migrate to Next.js framework for improved performance and routing
- Integrate Shadcn UI component library for enhanced UI/UX
- Use recharts instead of chart.js
- Unify deployment using Vercel for seamless frontend/backend integration
- Expand stock coverage and prediction timeframes
- Enhance prediction accuracy through improved machine learning models
