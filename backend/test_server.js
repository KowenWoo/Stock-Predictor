import axios from 'axios';
import { parseISO } from 'date-fns';

const API_URL = 'http://localhost:5001/api';
const STOCK = 'AAPL';

// TODO: 
// Add test for invalid data
// Add test for models endpoint
// -> Should add abort signal to axios requests
// -> Should add timeout to axios requests


async function testAPI() {
  try {
    const response = await axios.get(`${API_URL}/stock-data/${STOCK}`);
    console.log("API response:", JSON.stringify(response.data).substring(0,500)+"...");
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
  }
}

async function testCacheStatus() {
  try {
    const response = await axios.get(`${API_URL}/cache-status`);
    console.log("Last time cached:", parseISO(response.data['AAPL']['lastUpdated']).toLocaleString());
    console.log("Cache age (hours):", response.data['AAPL']['ageHours']);
  } catch (error) {
    console.error("Cache status error:", error.response?.data || error.message);
  }
}

async function testPredictions() {
  try {
    const response = await axios.get(`${API_URL}/predict/${STOCK}`);
    console.log("Predictions:", JSON.stringify(response.data));
  } catch (error) {
    console.error("Predictions error:", error.response?.data || error.message);
  }
}

// Run tests
console.log("Testing stock data endpoint...\n");
await testAPI();

console.log("\nTesting cache status endpoint...");
await testCacheStatus();

console.log("\nTesting predictions endpoint...");
await testPredictions();