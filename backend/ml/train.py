import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt

from dataset import TimeSeriesDataset
from model import TCN
from data_pipeline import download_data, prepare_data_x, prepare_data_y
from config import config

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
criterion = nn.MSELoss()

def mean_absolute_error(y_true, y_pred):
    return torch.mean(torch.abs(y_true - y_pred)).item()

def root_mean_squared_error(y_true, y_pred):
    return torch.sqrt(torch.mean((y_true - y_pred) ** 2)).item()

def mean_absolute_percentage_error(y_true, y_pred):
    return torch.mean(torch.abs((y_true - y_pred) / y_true)) * 100

def r2_score(y_true, y_pred):
    ss_total = torch.sum((y_true - torch.mean(y_true)) ** 2)
    ss_residual = torch.sum((y_true - y_pred) ** 2)
    return 1 - (ss_residual / ss_total).item()

def plot_metrics(history):
    """Plots training metrics over epochs."""
    epochs = range(1, len(history["loss"]) + 1)

    plt.figure(figsize=(12, 6))

    # Loss Plot
    plt.subplot(2, 3, 1)
    plt.plot(epochs, history["loss"], label="Loss", color="blue")
    plt.xlabel("Epochs")
    plt.ylabel("MSE Loss")
    plt.title("Training Loss")
    plt.legend()

    # MAE Plot
    plt.subplot(2, 3, 2)
    plt.plot(epochs, history["mae"], label="MAE", color="red")
    plt.xlabel("Epochs")
    plt.ylabel("MAE")
    plt.title("Mean Absolute Error")
    plt.legend()

    # RMSE Plot
    plt.subplot(2, 3, 3)
    plt.plot(epochs, history["rmse"], label="RMSE", color="green")
    plt.xlabel("Epochs")
    plt.ylabel("RMSE")
    plt.title("Root Mean Squared Error")
    plt.legend()

    # MAPE Plot
    plt.subplot(2, 3, 4)
    plt.plot(epochs, history["mape"], label="MAPE", color="orange")
    plt.xlabel("Epochs")
    plt.ylabel("MAPE (%)")
    plt.title("Mean Absolute Percentage Error")
    plt.legend()

    # R² Score Plot
    plt.subplot(2, 3, 5)
    plt.plot(epochs, history["r2"], label="R² Score", color="purple")
    plt.xlabel("Epochs")
    plt.ylabel("R² Score")
    plt.title("R² Score (Goodness of Fit)")
    plt.legend()

    plt.tight_layout()
    plt.show()


# Store metrics
history = {
    "loss": [],
    "mae": [],
    "rmse": [],
    "mape": [],
    "r2": []
}

# Training loop
def train_model(model, train_loader, val_loader, epochs=100):
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        total_mae, total_rmse, total_mape, total_r2 = 0, 0, 0, 0

        for x_batch, y_batch in train_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)

            optimizer.zero_grad()
            y_pred = model(x_batch)

            loss = criterion(y_pred, y_batch.view(-1, 1))
            loss.backward()
            optimizer.step()

            # Store batch-wise metrics
            total_loss += loss.item()
            total_mae += mean_absolute_error(y_batch, y_pred)
            total_rmse += root_mean_squared_error(y_batch, y_pred)
            total_mape += mean_absolute_percentage_error(y_batch, y_pred)
            total_r2 += r2_score(y_batch, y_pred)

        # Compute epoch averages
        avg_loss = total_loss / len(train_loader)
        avg_mae = total_mae / len(train_loader)
        avg_rmse = total_rmse / len(train_loader)
        avg_mape = total_mape / len(train_loader)
        avg_r2 = total_r2 / len(train_loader)

        # Store for visualization
        history["loss"].append(avg_loss)
        history["mae"].append(avg_mae)
        history["rmse"].append(avg_rmse)
        history["mape"].append(avg_mape)
        history["r2"].append(avg_r2)

        print(f"Epoch {epoch+1}: Loss={avg_loss:.4f}, MAE={avg_mae:.4f}, RMSE={avg_rmse:.4f}, MAPE={avg_mape:.2f}%, R²={avg_r2:.4f}")

    # Plot metrics after training
    plot_metrics(history)


if __name__ == "__main__":
    train_model(model, train_loader, val_loader, config["training"]["num_epoch"])
