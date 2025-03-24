import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cacheFunc from './cachefunc.js';
import { parseISO } from 'date-fns';




// TODO: 
// 1. I want to have caching for the data so I don't have to call the API every time
// - so I dont hit the API limit (24 hrs between every update so my data is still pretty new)
// 2. Add Health check endpoint nad also add the error handling
// 3. Add the prediction endpoint when the ML model is done
// 4. Potentially combine the 3 endpoints into one

// 5. Add abort signal to axios requests
// 6. Add timeout to axios requests
// 7. Add errors for invalid data and improper requests

// Progress:
// -- Added the caching
// -- Added the cache status endpoint
// -- Added the predictions for AAPL
// ...

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/.env` });
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FLASK_PORT = process.env.FLASK_PORT;
const PORT = process.env.PORT;

const app = express();
await cacheFunc.setupCacheDir();

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());


app.get('/api/stock-data/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  console.log(`\nGetting data for ${ticker}...`);
  
  // check cache and check if its fresh if not, then fetch from API
  const cachedData = await cacheFunc.getTheCachedData(ticker);
  if (cachedData.data && cachedData.data.timeCached) {
    console.log(`Cache found and last updated: ${parseISO(cachedData.data.timeCached).toLocaleString()}\n`);
  }
  if (cachedData.fresh) {
    console.log(`Using cached data for ${ticker}`);
    return res.json(cachedData.data);
  }
  
  try {
    console.log(`No cached data for ${ticker}...`);
    console.log(`Fetching ${ticker} from API...`);
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data['Error Message']) {
      return res.status(400).json({ error: response.data['Error Message'] });
    }
    
    
    const dataAndCacheTime = {
      ...response.data,
      timeCached: new Date().toISOString() // --> This is for checking the cache status later
    };
    
    await cacheFunc.saveToCache(ticker, dataAndCacheTime);
    
    res.json(dataAndCacheTime);
  } catch (error) {
    console.error(`API error for ${ticker}:`, error.message);
    
    // if theres an error, use the cache anyway whether or not its past 24 hrs
    if (cachedData.data) {
      console.log(`Trying to use old cache for ${ticker}...`);
      return res.json({
        ...cachedData.data,
        note: "Using old cached data due to API error"
      });
    }
    res.status(500).json({ error: 'Could not get stock data' }); // No cache to use
  }
});


app.get('/api/cache-status', async (req, res) => {
  try {
    const status = await cacheFunc.getCacheStatus();
    console.log("Cache status:", status);
    res.json(status);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pred endpoint, To be replaced with ML model later
// app.get('/api/predict/:ticker', (req, res) => {
  app.get('/api/predict/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const today = new Date().toISOString().split('T')[0];
  console.log(`\nGetting prediction for ${ticker}...`);
  
  const historical_data = await cacheFunc.getTheCachedData(ticker);
  if (!historical_data.data) {
    return res.status(400).json({ error: `No historical data found for ${ticker}` });
  }
  const data_required = {
    historical_data: historical_data.data,
    last_date: today
  }
  

  const pred = await axios.post(`http://127.0.0.1:5000/predict/${ticker}`, data_required);
  res.json(pred.data);
  // TODO: Turn to a list and include NVIDIA and Amazon
  // const predictions = {
  //   'AAPL': {
  //     "2025-03-21": 218.27,
  //     "2025-03-22": 200.10,
  //     "2025-03-23": 183.76,
  //     "2025-03-24": 185.45,
  //     "2025-03-25": 186.20,
  //     "2025-03-26": 187.55,
  //     "2025-03-27": 189.30,
  //     "2025-03-28": 188.75,
  //     "2025-03-29": 187.55,
  //     "2025-03-30": 189.30,
  //     "2025-04-01": 188.75,
  //     "2025-04-02": 197.55,
  //     "2025-04-03": 275.30,
  //     "2025-04-04": 300.75
  //   }
  // };
  // res.json({
  //   stock: ticker,
  //   predictions: predictions
  // })
});

app.get('/api/available-stocks', (req, res) => {
  // Just hardcoding this for now, will add NVIDIA and Amazon later when models are ready  
  const stocks = [
    { ticker: 'AAPL', name: 'Apple Inc.' }
  ];
  res.json(stocks);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});