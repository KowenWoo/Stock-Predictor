import axios from 'axios';

const API_URL = 'http://localhost:5001';
const STOCK = 'AAPL';


async function testPredAPI() {
    try {
        const response = await axios.post(`${API_URL}/predict/${STOCK}`);
        console.log("API response:", JSON.stringify(response.data).substring(0,500)+"...");
    } catch (error) {
        console.error("API error:", error.response?.data || error.message);
    }


}
testPredAPI();