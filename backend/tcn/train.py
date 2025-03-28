import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import json


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


# Training loop
def train_model(model, optimizer, device, train_loader, val_loader, epochs=100):
    
    # Store metrics for both training and validation
    history = {
        "train_loss": [], "train_mae": [], "train_rmse": [], "train_mape": [], "train_r2": [],
        "val_loss": [], "val_mae": [], "val_rmse": [], "val_mape": [], "val_r2": []
    }

    criterion = nn.MSELoss()

    for epoch in range(epochs):
        # Training phase
        model.train()
        train_total_loss = 0
        train_total_mae, train_total_rmse, train_total_mape, train_total_r2 = 0, 0, 0, 0

        for x_batch, y_batch in train_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)

            optimizer.zero_grad()
            y_pred = model(x_batch)

            loss = criterion(y_pred, y_batch.view(-1, 1))
            loss.backward()
            optimizer.step()

            # Store batch-wise metrics for training
            train_total_loss += loss.item()
            train_total_mae += mean_absolute_error(y_batch, y_pred)
            train_total_rmse += root_mean_squared_error(y_batch, y_pred)
            train_total_mape += mean_absolute_percentage_error(y_batch, y_pred)
            train_total_r2 += r2_score(y_batch, y_pred)

        # Compute epoch averages for training
        train_avg_loss = train_total_loss / len(train_loader)
        train_avg_mae = train_total_mae / len(train_loader)
        train_avg_rmse = train_total_rmse / len(train_loader)
        train_avg_mape = train_total_mape / len(train_loader)
        train_avg_r2 = train_total_r2 / len(train_loader)
        
        # Validation phase
        model.eval()
        val_total_loss = 0
        val_total_mae, val_total_rmse, val_total_mape, val_total_r2 = 0, 0, 0, 0
        
        with torch.no_grad():
            for x_batch, y_batch in val_loader:
                x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                y_pred = model(x_batch)
                
                val_loss = criterion(y_pred, y_batch.view(-1, 1))
                
                # Store batch-wise metrics for validation
                val_total_loss += val_loss.item()
                val_total_mae += mean_absolute_error(y_batch, y_pred)
                val_total_rmse += root_mean_squared_error(y_batch, y_pred)
                val_total_mape += mean_absolute_percentage_error(y_batch, y_pred)
                val_total_r2 += r2_score(y_batch, y_pred)
        
        # Compute epoch averages for validation
        val_avg_loss = val_total_loss / len(val_loader)
        val_avg_mae = val_total_mae / len(val_loader)
        val_avg_rmse = val_total_rmse / len(val_loader)
        val_avg_mape = val_total_mape / len(val_loader)
        val_avg_r2 = val_total_r2 / len(val_loader)

        # Store for visualization
        history["train_loss"].append(train_avg_loss)
        history["train_mae"].append(train_avg_mae)
        history["train_rmse"].append(train_avg_rmse)
        history["train_mape"].append(train_avg_mape)
        history["train_r2"].append(train_avg_r2)
        
        history["val_loss"].append(val_avg_loss)
        history["val_mae"].append(val_avg_mae)
        history["val_rmse"].append(val_avg_rmse)
        history["val_mape"].append(val_avg_mape)
        history["val_r2"].append(val_avg_r2)

        # Print progress
        print(f"Epoch {epoch+1}/{epochs}")
        print(f"  Training:   Loss={train_avg_loss:.4f}, MAE={train_avg_mae:.4f}, RMSE={train_avg_rmse:.4f}, MAPE={train_avg_mape:.2f}%, R²={train_avg_r2:.4f}")
        print(f"  Validation: Loss={val_avg_loss:.4f}, MAE={val_avg_mae:.4f}, RMSE={val_avg_rmse:.4f}, MAPE={val_avg_mape:.2f}%, R²={val_avg_r2:.4f}")

    # Plot metrics after training
    history_serializable = {
        "train_loss": [float(x) for x in history["train_loss"]],
        "train_mae": [float(x) for x in history["train_mae"]],
        "train_rmse": [float(x) for x in history["train_rmse"]],
        "train_mape": [float(x) for x in history["train_mape"]],
        "train_r2": [float(x) for x in history["train_r2"]],
        "val_loss": [float(x) for x in history["val_loss"]],
        "val_mae": [float(x) for x in history["val_mae"]],
        "val_rmse": [float(x) for x in history["val_rmse"]],
        "val_mape": [float(x) for x in history["val_mape"]],
        "val_r2": [float(x) for x in history["val_r2"]],
    }

    # Save the serializable dictionary
    save_json(history_serializable, "history.json")
    # plot_metrics(history)
    
    # return history, model

def save_json(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

def plot_metrics(history):
    plt.figure(figsize=(12, 6))
    
    plt.subplot(2, 2, 1)
    plt.plot(history["train_loss"], label="Training Loss", color="blue")
    plt.plot(history["val_loss"], label="Validation Loss", color="red")
    plt.title("Loss")
    plt.legend()
    
    plt.subplot(2, 2, 2)
    plt.plot(history["train_mae"], label="Training MAE", color="blue")
    plt.plot(history["val_mae"], label="Validation MAE", color="red")
    plt.title("Mean Absolute Error")
    plt.legend()
    
    plt.subplot(2, 2, 3)
    plt.plot(history["train_rmse"], label="Training RMSE", color="blue")
    plt.plot(history["val_rmse"], label="Validation RMSE", color="red")
    plt.title("Root Mean Squared Error")
    plt.legend()
    
    plt.subplot(2, 2, 4)
    plt.plot(history["train_r2"], label="Training R²", color="blue")
    plt.plot(history["val_r2"], label="Validation R²", color="red")
    plt.title("R²")
    plt.legend()
    
    plt.tight_layout()
    plt.show()
    
    return plt