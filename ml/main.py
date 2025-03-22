from train import train_model
from model import TCN
from dataset import TimeSeriesDataset
from data_pipeline import download_data, prepare_data_x, prepare_data_y
from config import config

import torch
import numpy as np
import matplotlib.pyplot as plt

def train():
    # Fetch and process data
    data_date, data_close_price = download_data()
    data_x = prepare_data_x(data_close_price, config["data"]["window_size"])
    data_y = prepare_data_y(data_close_price, config["data"]["window_size"])

    # Train model
    train_model(data_x, data_y)

def inference(output_length):
    # Fetch and process data
    data_date, data_close_price = download_data()
    data_x = prepare_data_x(data_close_price, config["data"]["window_size"])
    data_y = prepare_data_y(data_close_price, config["data"]["window_size"])

    # Initialize model
    model = TCN()
    model.load_state_dict(torch.load("model.pth"))
    model.eval()

    # Make predictions
    with torch.no_grad():
        y_pred = model(torch.tensor(data_x, dtype=torch.float32).unsqueeze(2)).squeeze().numpy()
    
    # Plot predictions
    plot_predictions(data_date, data_close_price, y_pred)

def plot_predictions(dates, actual_prices, predicted_prices):
    plt.figure(figsize=(12, 6))
    plt.plot(dates, actual_prices, label="Actual Prices", color="blue")
    plt.plot(dates[-len(predicted_prices):], predicted_prices, label="Predicted Prices", color="red")
    plt.xlabel("Date")
    plt.ylabel("Stock Price")
    plt.title("Stock Price Prediction vs Actual")
    plt.legend()
    plt.show()

