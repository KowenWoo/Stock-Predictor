import { useState, useEffect } from 'react';
import './index.css';
import { set } from 'date-fns';
import StockChart from './components/stockchart';
// Hardcoded stock data for now
// Will be replaced with API calls to get real-time data

const mockPredictions = {
  'AAPL':{
    "2025-03-21": 218.27,
    "2025-03-22": 200.10,
    "2025-03-23": 183.76,
    "2025-03-24": 185.45,
    "2025-03-25": 186.20,
    "2025-03-26": 187.55,
    "2025-03-27": 189.30,
    "2025-03-28": 188.75,
    "2025-03-29": 187.55,
    "2025-03-30": 189.30,
    "2025-04-01": 188.75,
    "2025-04-02": 197.55,
    "2025-04-03": 275.30,
    "2025-04-04": 300.75
  }
}

function App() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState({ stock: '', date: '', price: 0, change: 0 });
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load from local JSON file instead of API
        const response = await fetch(`/data/${selectedStock.toLowerCase()}.json`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Process Alpha Vantage data
        const timeSeries = data['Time Series (Daily)'];
        
        // Get the last 30 days of data
        const dates = Object.keys(timeSeries).sort().slice(-365);
        const historicalData = {};
        
        dates.forEach(date => {
        historicalData[date] = timeSeries[date];
    
        });
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
        setStockData({
          historical: historicalData,
          prediction: mockPredictions[selectedStock]
        });
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [selectedStock]);
  // PRICE CHANGE CALCULATIONS
  // Just hardcoded some stuff for now for testing purposes

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
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2">Loading stock data...</p>
          </div>
          ) : (
          <div className="flex justify-center h-120 rounded-lg items-center border-1 
                        backdrop-blur-2xl border-[#53565A]">
            <StockChart data={stockData} symbol={selectedStock} />
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

export default App;