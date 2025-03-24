import axios from 'axios';

const API_URL = 'http://localhost:5001';
const STOCKS = ['AAPL'];


const sampleHistoricalData = [
  156.32, 157.83, 159.10, 158.45, 160.11, 
  162.55, 161.87, 163.76, 165.34, 166.18, 
  164.25, 165.93, 167.79, 170.12, 168.75, 
  167.33, 169.59, 171.08, 172.55, 175.22
];

const today = new Date().toISOString().split('T')[0];

async function testValidPrediction(ticker) {
  try {
    console.log(`\n📊 Testing valid prediction for ${ticker}...`);
    
    const requestData = {
      historical_data: sampleHistoricalData,
      last_date: today
    };
    
    console.log(`Request data: ${JSON.stringify(requestData)}`);
    
    const response = await axios.post(
      `${API_URL}/predict/${ticker}`, 
      requestData
    );
    
    console.log(`✅ Success! Got prediction for ${ticker}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Prediction data: ${JSON.stringify(response.data)}`);
    
    if (response.data.predictions) {
      const predictionDates = Object.keys(response.data.predictions);
      console.log(`Prediction dates: ${predictionDates.join(', ')}`);
      console.log(`Number of predictions: ${predictionDates.length}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error testing prediction for ${ticker}:`);
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received from server. Is the Flask app running?");
    } else {
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
}

async function testInvalidData() {
  try {
    console.log("\n🧪 Testing with invalid data (missing historical_data)...");
    
    const response = await axios.post(
      `${API_URL}/predict/AAPL`, 
      { last_date: today } // Missing historical_data (testing purposes)
    );
    
    console.log("Response:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Error (expected):");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
}

async function testModelsEndpoint() {
  try {
    console.log("\n🔍 Testing available models endpoint...");
    
    const response = await axios.get(`${API_URL}/models`);
    
    console.log("✅ Success! Got models information");
    console.log(`Available models: ${JSON.stringify(response.data.available_models)}`);
    console.log(`Loaded models: ${JSON.stringify(response.data.loaded)}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error getting models:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received. Is the Flask app running?");
    } else {
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
}

// All tests in one main test
async function runAllTests() {
  console.log("🧪 Starting Flask API tests...");
  
  await testModelsEndpoint();
  
  for (const stock of STOCKS) {
    await testValidPrediction(stock);
  }
  
  await testInvalidData();
  
  console.log("\n🏁 All tests completed!");
}

runAllTests();