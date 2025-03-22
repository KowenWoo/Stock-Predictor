import requests
import json
import os

def fetch_stock_data(ticker="AAPL"):
    """Fetch stock data from Alpha Vantage API and save to JSON file"""
    
    # Use the API key from your existing code
    API_KEY = "GEJ72SZY71P1221Y"
    
    # Make the API request
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&outputsize=full&apikey={API_KEY}"
    
    print(f"Fetching data for {ticker}...")
    response = requests.get(url)
    data = response.json()
    
    # Check if there was an error in the response
    if "Error Message" in data:
        print(f"Error: {data['Error Message']}")
        return
    
    # Create a data directory if it doesn't exist
    if not os.path.exists("data"):
        os.makedirs("data")
    
    # Save the data to a JSON file
    filename = f"data/{ticker.lower()}.json"
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Data saved to {filename}")
    print(f"Contains {len(data['Time Series (Daily)'])} days of stock data")

if __name__ == "__main__":
    # Fetch data for Apple (AAPL)
    fetch_stock_data("AAPL")
    
    # Uncomment these lines to fetch data for other stocks
    # fetch_stock_data("AMZN")
    # fetch_stock_data("NVDA")