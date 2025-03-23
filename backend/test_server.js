import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const STOCK = 'AAPL';

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
    console.log("Cache status:", JSON.stringify(response.data));
  } catch (error) {
    console.error("Cache status error:", error.response?.data || error.message);
  }
}

// Run tests
console.log("Testing stock data endpoint...");
await testAPI();

console.log("\nTesting cache status endpoint...");
await testCacheStatus();