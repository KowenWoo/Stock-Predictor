'''
Data pipeline for Alpha Vantage API key
'''

import numpy as np
from alpha_vantage.timeseries import TimeSeries
from config import config

def download_data():
    """Fetch stock price data using Alpha Vantage API."""
    ts = TimeSeries(config["alpha_vantage"]["key"]) 
    data, _ = ts.get_daily(config["alpha_vantage"]["symbol"], outputsize=config["alpha_vantage"]["outputsize"])

    # Sort data by date (oldest to newest)
    data_date = sorted(data.keys())
    data_close_price = np.array([float(data[date][config["alpha_vantage"]["key_close"]]) for date in data_date])

    print(f"Data retrieved from {data_date[0]} to {data_date[-1]}")
    return data_date, data_close_price

def prepare_data_x(x, window_size):
    """Prepare input sequences for training."""
    n_row = x.shape[0] - window_size  # Fix indexing issue
    return np.lib.stride_tricks.as_strided(x, shape=(n_row, window_size), strides=(x.strides[0], x.strides[0]))

def prepare_data_y(x, window_size):
    """Prepare target labels."""
    return x[window_size:]  # Properly aligns y with x

