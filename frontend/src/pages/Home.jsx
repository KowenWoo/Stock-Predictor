import { useState, useEffect } from 'react';
import StockChart from '../components/stockChart';
import '../index.css';
import 'dotenv';
import axios from 'axios';




// TODO:
// 1. Add a loading spinner when the data is being fetched
// 2. Process some additional info from the stock data so we can send them over
//    and display them in the UI
// 3. Add some error handling in case the data fetching fails
// 4. Add the API calls to get the real stock data, updated, after server.js is done
// 5. Add the API calls to get the real stock predictions, after the ML model is done
// 6. Add ARIA labels for accessibility
// ....


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Home() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState({ stock: '', date: '', price: 0, change: 0 });
  const [stockInfo, setStockInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableStocks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/available-stocks`);
        setAvailableStocks(response.data);
 
      } catch (err) {
        console.error('Error getting available stocks:', err);
        setError('Failed to load available stocks. Please try again later.');
      }
    };
    fetchAvailableStocks();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      try {

        const stockResponse = await axios.get(`${API_BASE_URL}/api/stock-data/${selectedStock}`);
        const predictionResponse = await axios.get(`${API_BASE_URL}/api/predict/${selectedStock}`);

        const timeSeries = stockResponse.data['Time Series (Daily)'];
        // Last 365trading days ( will be replace by a selector where we can choose what to display)
        const dates = Object.keys(timeSeries).sort().slice(-365);
        const historricalData = {};

        dates.forEach(date => {
          historricalData[date] = timeSeries[date];
        });
        setStockData(
          {
            historical: historricalData,
            prediction: predictionResponse.data.predictions
          }
        );
        setPrediction(predictionResponse.data.predictions);

      } catch (err) {
        console.error('Error getting stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
      
        // // Get stock info
        // if (Objects.keys(historicalData).length > 0) {
        //   const latestDate = dates[dates.length - 1];
        //   const latestData = parseFloat(historicalData[latestDate]['4. close']);
        //   const stockName = data['Meta Data']['2. Symbol'];
          
        //   const formattedDate = new Date(latestDate).toLocaleDateString('en-US', {
        //     weekday: 'long',
        //     month: 'long',
        //     day: 'numeric',
        //     year: 'numeric'
        //   });
        //   setStockInfo({
        //     stock: stockName,
        //     date: formattedDate,
        //     price: latestData,
        //     change: latestData - parseFloat(historicalData[dates[dates.length - 2]]['4. close'])});
        // }
        // Combine with mock predictions
    
    };
    fetchStockData();
  }, [selectedStock, API_BASE_URL]);
    
  // Just hardcoded some stuff for now for testing purposes

  // Handle chart data processing
  const handleChartDataProcessed = (data) => {
    console.log("Chart data processed:", data);
  };


  return (
    <div className="min-h-screen">
      {/* Main content */}
      <h1 className="text-3xl font-bold text-center mt-8">StockVison.AI</h1>
      <h2 className="text-l font-extralight text-center">Stock price predictions and analysis</h2>
      <main className="mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <h2 className="text-xl font-semibold">{selectedStock}</h2>

          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-2xl font-bold">Price here</div>
            <div className='text-sm text-green-500'>
               ▲ $Price
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center p-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
              <p className="mt-2">Loading stock data...</p>
          </div>
          ) : (
          <div className="flex justify-center h-120 rounded-lg items-center border-1 
                        backdrop-blur-2xl border-[#53565A]">
            <StockChart data={stockData} symbol={selectedStock} onDataProcessed={handleChartDataProcessed} />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h1 className="text-l">Stock Prediction</h1>            
            <p>
              key predictions here
            </p>              
          </div>
          <div className="p-6 rounded-lg shadow-sm border-1 backdrop-blur-2xl border-[#53565A]">
            <h1 className = "text-l">Stock Info</h1>
            <p>
              Stock info here
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Home;