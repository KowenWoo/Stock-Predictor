import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the .env file');
}

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    db = client.db("stocks");
    
    await db.collection('info').createIndex({ ticker: 1 }, { unique: true });
    await db.collection('name').createIndex({ ticker: 1 }, { unique: true });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); 
  }
}

app.use(cors());
app.use(express.json());


app.get('/api/available-stocks', (req, res) => {
  const stocks = ['AAPL'];
  res.json(stocks);
});



async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();


process.on('SIGINT', async () => {
  console.log('Server is shutting down...');
  await client.close();
  process.exit(0);
});
