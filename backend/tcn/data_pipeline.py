'''
Data pipeline for Alpha Vantage API key
'''

import numpy as np
from alpha_vantage.timeseries import TimeSeries
import torch
from config import config

import matplotlib.pyplot as plt
from pandas.plotting import autocorrelation_plot
import json

def download_data():
    """Fetch stock price data using Alpha Vantage API."""
    ts = TimeSeries(config["alpha_vantage"]["key"]) 
    data, _ = ts.get_daily(config["alpha_vantage"]["symbol"], outputsize=config["alpha_vantage"]["outputsize"])

    # Sort data by date (oldest to newest)
    data_date = sorted(data.keys())
    data_close_price = np.array([float(data[date][config["alpha_vantage"]["key_close"]]) for date in data_date])

    # Z-score normalization
    data_close_price_norm = (data_close_price - np.mean(data_close_price)) / np.std(data_close_price)

    print(f"Data retrieved from {data_date[0]} to {data_date[-1]}")
    return data_date, data_close_price_norm
    
def prepare_data_x(x, window_size):
    """Prepare input sequences for training."""
    n_row = x.shape[0] - window_size  # Fix indexing issue
    return np.lib.stride_tricks.as_strided(x, shape=(n_row, window_size), strides=(x.strides[0], x.strides[0]))

def prepare_data_y(x, window_size):
    """Prepare target labels."""
    return x[window_size:]  # Properly aligns y with x


class TimeSeriesDataset(torch.utils.data.Dataset):
    def __init__(self, x, y):
        self.x = torch.tensor(x, dtype=torch.float32).permute(0, 2, 1)  # (batch, channels, seq_len)
        self.y = torch.tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.x[idx], self.y[idx]

def plot_data(data_date, data_close_price):
    """Plot stock price data."""
    plt.figure(figsize=(12, 6))
    plt.plot(data_date, data_close_price, label="Close Price", color=config["plots"]["color_actual"])
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    plt.title(f"{config['alpha_vantage']['symbol']} Stock Price")
    plt.xticks(np.arange(0, len(data_date), config["plots"]["xticks_interval"]), rotation=45)
    plt.legend()
    plt.show()

def test():
    file_path = "history.json"
    with open(file_path, "r") as json_file:
        data = json.load(json_file)

    plt.figure(figsize=(2, 2))

    plt.subplot(2, 2, 1)
    data_date, data_close_price = download_data()
    plot_data(data_date, data_close_price)

    plt.subplot(2, 2, 2)
    autocorrelation_plot(data_close_price)
    plt.show()

    plt.subplot(2, 2, 3)
    plt.plot(data["train_loss"], label="Training Loss", color="blue")
    plt.plot(data["val_loss"], label="Validation Loss", color="red")
    plt.legend()
    plt.title("Learning Curves")
    plt.show()

    plt.subplot(2, 2, 4)
    plt.plot(data["train_mae"], label="Training MAE", color="blue")
    plt.plot(data["val_mae"], label="Validation MAE", color="red")
    plt.legend()
    plt.title("Mean Absolute Error")
    plt.show()

test()