from train import train_model
from model import TCN
from data_pipeline import download_data, prepare_data_x, prepare_data_y, TimeSeriesDataset
from config import config

import torch
import numpy as np
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

def train():
    # Load and preprocess data
    data_date, data_close_price = download_data()
    data_x = prepare_data_x(data_close_price, config["data"]["window_size"])
    data_y = prepare_data_y(data_close_price, config["data"]["window_size"])
    data_x = data_x.reshape(data_x.shape[0], data_x.shape[1], 1) # Ensure correct shape: (num_samples, sequence_length, num_features)

    # Split dataset
    split_index = int(data_y.shape[0] * config["data"]["train_split_size"])
    dataset_train = TimeSeriesDataset(data_x[:split_index], data_y[:split_index])
    dataset_val = TimeSeriesDataset(data_x[split_index:], data_y[split_index:])

    train_loader = DataLoader(dataset_train, batch_size=config["training"]["batch_size"], shuffle=True)
    val_loader = DataLoader(dataset_val, batch_size=config["training"]["batch_size"], shuffle=False)

    # Initialize model
    device = torch.device(config["training"]["device"])
    model = TCN(input_size= config["apple"]["input_size"],  # One feature (closing price)
                output_size=config["apple"]["output_size"],  # Predicting one value
                num_channels=config["apple"]["channels"],  
                kernel_size=config["apple"]["kernel_size"],
                dropout=0.2).to(device)

    optimizer = optim.Adam(model.parameters(), lr=config["training"]["learning_rate"])

    train_model(model, optimizer, device, train_loader, val_loader, config["training"]["num_epoch"])


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

if __name__ == "__main__":
    train()