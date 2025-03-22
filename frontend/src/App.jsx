import { useState, useEffect } from 'react';
import './index.css';

// Hardcoded stock data for now
// Will be replaced with API calls to get real-time data
const STOCKS = {
  'AAPL': {
    name: 'Apple Inc.',
    symbol: 'AAPL',
    currentPrice: 175.34,
    previousClose: 171.21,
  }
};

function App() {
  // Future plans for loading in the stock data


  // JUST APPLE FOR NOW
  const symbol = 'AAPL';
  const stockInfo = STOCKS[symbol];
  
  // PRICE CHANGE CALCULATIONS
  // Just hardcoded some stuff for now for testing purposes
  const priceChange = stockInfo.currentPrice - stockInfo.previousClose;
  const changePercentage = (priceChange / stockInfo.previousClose) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen">
      {/* Main content */}
      <main className="mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold">{stockInfo.name}</h2>
            <div className="text-sm">{stockInfo.symbol}</div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-2xl font-bold">Price here</div>
            <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)} ({changePercentage.toFixed(2)}%)
            </div>
          </div>
        </div>    
        <div className="flex justify-center h-96 rounded-lg items-center border-1 
                        backdrop-blur-2xl border-[#53565A]">
          <h1>Stock Chart here</h1>
        </div>
        {/* Additional information section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h2 className="text-l font-semibold mb-4">Prediction Insights</h2>
            <p className="text-sm">
              Prediction insights will appear here.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h2 className="text-l font-semibold mb-4">Key Metrics</h2>
            <p className="text-sm">
              metrics <br />
              metrics <br />
              metrics <br />
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;