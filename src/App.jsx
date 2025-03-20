// src/App.jsx
import { useState, useEffect } from 'react';
import './index.css';


{/* TODO: 
  - Calculate price change
  - Get current price
  - Calculate change percentage
  - Format change percentage/price/and percentage on top right
    bolded, big text, color coded (green/red) with an arrow
  - Add stock chart
  - Add loading screen and error handling for the stock chart
  - format grid for prediction insights and key metrics
  */}


function App() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // JUST APPLE FOR NOW
  const symbol = 'AAPL';
  const stockInfo = STOCKS[symbol];
  

  // Calculations here


  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold">{stockInfo.name}</h2>
            <div className="text-gray-600 text-sm">{stockInfo.symbol}</div>
          </div>
          
          {<h1>Current Price</h1> && (
            <div className="mt-4 md:mt-0">
              <div className="">price change here</div>
              <div className="text-sm">
                change w/ color formatting
              </div>
            </div>
          )}
        </div>    
        <div className="flex justify-center h-96 rounded-lg items-center border-1 
                        backdrop-blur-2xl border-[#53565A]">
          <h1>Stock Chart here</h1>
        </div>
        {/* Additional information section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h2 className="text-l font-semibold mb-4">Prediction Insights</h2>
            <p className="sm">
              Prediction suff
            </p>
          </div>
          <div className=" p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h2 className="text-l font-semibold mb-4">Key Metrics</h2>
            <p className="text-sm">
              Some metrics here (Market cap, Change, etc.)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;