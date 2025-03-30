import os
import json
import datetime
from collections import OrderedDict


current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
cache_dir = os.path.join(backend_dir, 'cache')
cache_file = os.path.join(cache_dir, "aapl.json")

def getPrice():    
    # Check if cache file exists
    if not os.path.exists(cache_file):
        print(f"No cache file found for appl")

        
    # key mapping for the JSON file
    price_key_map = {
        "open": "1. open",
        "high": "2. high",
        "low": "3. low",
        "close": "4. close",
        "volume": "5. volume"
    }

    price_key = price_key_map.get("close".lower(), "4. close")

    # Read the cache file
    try:
        with open(cache_file, 'r') as f:
            data = json.load(f)
        
        # Extract the time series data (this is where the prices are)
        if "Time Series (Daily)" in data:
            time_series = data["Time Series (Daily)"]
            
            # Convert to list of (date, price) tuples and sort by date (newest first)
            price_data = [(date, float(daily_data[price_key])) 
                            for date, daily_data in time_series.items()]
            price_data.sort(reverse=True)
            
            # adjust the number depending on how many days you want
            price_data = price_data[:50] 
            
            prices = [price for date, price in price_data] # List of  tuples (date, price)
            prices_one = [price_data[0][0]]  + prices # List of  tuples (date, price)
            return prices_one
        else:
            print(f"No time series data found in cache file for appl")
            
    except Exception as e:
        print(f"Error reading or processing cache file for appl: {e}")


getPrice()

