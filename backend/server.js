import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// TODO: 
// 1. I want to have caching for the data so I don't have to call the API every time
// - so I dont hit the API limit (24 hrs between every update so my data is still pretty new)
// 2. Add Health check endpoint nad also add the error handling
// 3. Add the prediction endpoint when the ML model is done


const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: `${__dirname}/.env` });
console.log("Alpha Vantage API Key:", process.env.ALPHA_VANTAGE_API_KEY ? "Found" : "Not Found");


const app = express();


app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

app.get('/api/stock-data/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  
  try {
    console.log(`Getting the ${ticker} stock...`);
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${API_KEY}`;
    const response = await axios.get(url);
    
    // Check if API returned an error
    if (response.data['Error Message']) {
      return res.status(400).json({ error: response.data['Error Message'] });
    }
    
    // Return the data from Alpha Vantage
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error.message);
    res.status(500).json({ error: 'Failed to get stock data' });
  }
});

// ADD the prediction endpoint when the ML model is done
app.get('/api/available-stocks', (req, res) => {
  const stocks = [ // Just apple for now, but we'll add NVIDIA and AMAZON later
    { ticker: 'AAPL', name: 'Apple Inc.' }
  ];
  res.json(stocks);
});
// add the error handling here smh 

app.listen(5001, () => {
  console.log(`Server running on port 5001`);
});