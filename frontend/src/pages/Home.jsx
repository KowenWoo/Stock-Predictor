import { useState, useEffect } from 'react';
import StockChart from '../components/stockChart';
import { format } from 'date-fns';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function Home() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [chartMetrics, setChartMetrics] = useState(null);
  const [availableStocks, setAvailableStocks] = useState([
    { ticker: 'AAPL', name: 'Apple Inc.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch available stocks
  useEffect(() => {
    const fetchAvailableStocks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stocks/available`);
        if (response.data && response.data.stocks) {
          const stockNames = {
            'AAPL': 'Apple Inc.',
            'AMZN': 'Amazon.com Inc.',
            'NVDA': 'NVIDIA Corporation'
          };
          const stocks = response.data.stocks.map(ticker => ({
            ticker,
            name: stockNames[ticker] || ticker
          }));
          setAvailableStocks(stocks);
        }
      } catch (err) {
        console.error('Error getting available stocks:', err);
        // Keep default stocks if API fails
      }
    };

    fetchAvailableStocks();
  }, []);

  // Fetch stock data and predictions
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use Promise.all for parallel requests
        const [historyResponse, predictionResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/stocks/history/${selectedStock}?days=365`),
          axios.post(`${API_BASE_URL}/api/predictions/${selectedStock}`)
        ]);

        // Process historical data - convert array to object keyed by date
        const historicalData = {};
        if (historyResponse.data.prices) {
          historyResponse.data.prices.forEach(item => {
            historicalData[item.date] = {
              '4. close': item.price.toString()
            };
          });
        }

        // Process prediction data - convert array to object keyed by date
        const predictionData = {};
        if (predictionResponse.data.predictions) {
          predictionResponse.data.predictions.forEach(item => {
            predictionData[item.date] = item.price;
          });
        }

        // Set combined data
        setStockData({
          historical: historicalData,
          prediction: predictionData
        });
      } catch (err) {
        console.error('Error getting stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [selectedStock]);

  // Handle stock selection change
  const handleStockChange = (e) => {
    setSelectedStock(e.target.value);
  };

  // Handle chart metrics update
  const handleChartDataProcessed = (metrics) => {
    setChartMetrics(metrics);
  };

  // Handle update data button
  const handleUpdateData = async () => {
    setUpdating(true);
    try {
      await axios.post(`${API_BASE_URL}/api/stocks/update/${selectedStock}`);
      // Refetch stock data after update
      const [historyResponse, predictionResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stocks/history/${selectedStock}?days=365`),
        axios.post(`${API_BASE_URL}/api/predictions/${selectedStock}`)
      ]);

      const historicalData = {};
      if (historyResponse.data.prices) {
        historyResponse.data.prices.forEach(item => {
          historicalData[item.date] = {
            '4. close': item.price.toString()
          };
        });
      }

      const predictionData = {};
      if (predictionResponse.data.predictions) {
        predictionResponse.data.predictions.forEach(item => {
          predictionData[item.date] = item.price;
        });
      }

      setStockData({
        historical: historicalData,
        prediction: predictionData
      });
    } catch (err) {
      console.error('Error updating stock data:', err);
      setError('Failed to update stock data. You may have reached the API rate limit.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2F2E2E] from-12% via-[#262525] via-39% to-[#1A1A1A] to-75% text-[#DAD7CD]">
      <header className="pt-8 pb-4 px-4">
        <h1 className="text-5xl font-bold text-center">StockVision.AI</h1>
        <h2 className="text-lg font-extralight text-center">AI-powered stock predictions and analysis</h2>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">{selectedStock}</h2>
              {/* Selector */}
              <select
                value={selectedStock}
                onChange={handleStockChange}
                className="bg-none border border-gray-700/15 rounded-md p-2 text-sm hover:bg-[#121311] focus:outline-none focus:ring-2 focus:ring-black/50"
              >
                {availableStocks.map(stock => (
                  <option key={stock.ticker} value={stock.ticker}>
                    {stock.name}
                  </option>
                ))}
              </select>
              {/* Update Data Button */}
              <button
                onClick={handleUpdateData}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {updating ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Update Data</span>
                  </>
                )}
              </button>
            </div>

            {chartMetrics?.latestHistoricalDate && (
              <div className="mt-2 text-sm text-gray-400">
                As of {format(new Date(chartMetrics.latestHistoricalDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {chartMetrics && (
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold">
                ${chartMetrics.latestHistoricalPrice?.toFixed(2)}
              </div>
              <div className={`text-sm ${chartMetrics.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {chartMetrics.percentChange >= 0 ? '▲' : '▼'}
                ${Math.abs(chartMetrics.priceChange).toFixed(2)}
                ({Math.abs(chartMetrics.percentChange).toFixed(2)}%)
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
            <p className="ml-3">Loading stock data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-96 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="h-96 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
            <StockChart
              data={stockData}
              symbol={selectedStock}
              onDataProcessed={handleChartDataProcessed}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

          <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
            <h2 className="text-xl font-semibold mb-4">Prediction Insights</h2>

            {!chartMetrics ? (
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-3/4 bg-gray-700/40 rounded"></div>
                <div className="h-5 w-1/2 bg-gray-700/40 rounded"></div>
              </div>
            ) : (
              <>
                <div className={`text-lg font-medium ${chartMetrics.percentChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {chartMetrics.percentChange >= 0 ? 'Bullish Trend' : 'Bearish Trend'}
                </div>

                <p className="text-sm mt-2 text-gray-300">
                  {selectedStock} shows a {chartMetrics.percentChange >= 0 ? 'positive' : 'negative'} trend with a
                  projected {chartMetrics.percentChange >= 0 ? 'increase' : 'decrease'} of
                  {' '}{Math.abs(chartMetrics.percentChange).toFixed(2)}% over the prediction period.
                </p>

                <div className="mt-6">
                  <div className="text-sm text-gray-400 mb-1">AI Trading Signal</div>
                  <div className={`text-lg font-bold ${chartMetrics.percentChange > 5 ? 'text-green-500' :
                    chartMetrics.percentChange > 0 ? 'text-green-400' :
                      chartMetrics.percentChange > -5 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                    {chartMetrics.percentChange > 5 ? 'Strong Buy' :
                      chartMetrics.percentChange > 0 ? 'Buy' :
                        chartMetrics.percentChange > -5 ? 'Hold' : 'Sell'}
                  </div>
                </div>
              </>
            )}

            {/* Disclaimer */}
            <div className="mt-6 text-xs text-gray-500 italic">
              This is an AI-generated prediction and should not be the sole basis for investment decisions.
            </div>
          </div>

          {/* Stock Metrics */}
          <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
            <h2 className="text-xl font-semibold mb-4">Stock Metrics</h2>

            {!chartMetrics ? (
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-3/4 bg-gray-700/40 rounded"></div>
                <div className="h-5 w-1/2 bg-gray-700/40 rounded"></div>
              </div>
            ) : (
              <>
                {/* Current Price */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Latest Price ({format(new Date(chartMetrics.latestHistoricalDate), 'MMM d, yyyy')})</div>
                  <div className="text-2xl font-bold">${chartMetrics.latestHistoricalPrice?.toFixed(2)}</div>
                </div>

                {/* Prediction */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Predicted Price ({format(new Date(chartMetrics.latestPredictionDate), 'MMM d, yyyy')})</div>
                  <div className="text-2xl font-bold">${chartMetrics.latestPredictionPrice?.toFixed(2)}</div>
                  <div className={`text-sm ${chartMetrics.percentChange >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                    {chartMetrics.percentChange >= 0 ? '▲' : '▼'} ${Math.abs(chartMetrics.priceChange).toFixed(2)} ({Math.abs(chartMetrics.percentChange).toFixed(2)}%)
                  </div>
                </div>

                {/* Prediction Period */}
                <div className="mt-6 text-sm text-gray-400">
                  <div>Prediction Period</div>
                  <div className="text-white">
                    {format(new Date(chartMetrics.latestHistoricalDate), 'MMM d, yyyy')} to {format(new Date(chartMetrics.latestPredictionDate), 'MMM d, yyyy')}
                    <span className="text-gray-400 ml-2">
                      ({Math.floor((new Date(chartMetrics.latestPredictionDate) - new Date(chartMetrics.latestHistoricalDate)) / (1000 * 60 * 60 * 24))} days)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8">
        <p>© 2025 StockVision.AI - AI-powered stock predictions</p>
      </footer>
    </div>
  );
}

export default Home;