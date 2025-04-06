"""
LSTM model for time series forecasting trained on Google Colab: 
https://colab.research.google.com/drive/14b6nR3UrAH46HE0I7HhbE4o1ST0yAKH6#scrollTo=jboL2ugAVKJD

Prediction process:
    1. Load data - most recent 50 days of closing prices
    2. Preprocess data - reshape to (1, 50, 1)
    3. Predict next data point 30 times
    4. Append average of predictions to data and move sliding window over 1 day 
        ie remove oldest data point and add new data point
    5. Repeat steps 3-4 for 50 days
    6. Calculate confidence intervals for each prediction
    7. Visualize predictions and confidence intervals
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from scipy import stats
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from alpha_vantage.timeseries import TimeSeries
from test_model import getPrice
from joblib import dump, load

# Preprocessing Function
def preprocess_data(prices, window_size=50):
    prices = np.array(prices).reshape(-1, 1)  # Reshape to (n_samples, 1)
    # print(prices)  # Reshape for model input
    return prices


def append_new_point(existing_array, new_point):
    """
    Append a new data point to an existing array with shape (1, window_size, 1)
    while maintaining the sliding window structure.
    
    Parameters:
    existing_array (np.array): Existing array of shape (1, window_size, 1)
    new_point (float): New data point to append
    window_size (int): Size of the sliding window
    
    Returns:
    np.array: Updated array with shape (1, window_size, 1)
    """
    updated_array = existing_array[1:]
    
    # Add the new point as a new row at the end
    new_point_array = np.array(new_point)
    # print(new_point_array)
    
    # Concatenate the arrays
    updated_array = np.concatenate((updated_array, new_point_array), axis=0)
    
    return updated_array


# def evaluate(predictions, window_size=50):
#     '''
#     find confidence interval for each prediction (30 sample size)
#     Visualize them as bands around your mean prediction line
#     '''
#     #90% confidence intervals for each prediction
#     df = len(predictions) - 1
#     alpha = 0.1
#     conf_int = []
#     for i in range(window_size):
#         mean = np.mean(predictions[i])
#         se = np.std(predictions[i]) / np.sqrt(len(predictions[i]))
#         t_crit = stats.t.ppf(1-alpha/2, df)
#         conf_int.append((mean - t_crit * se, mean + t_crit * se))
#     return conf_int


# def visualize_ci(predictions, conf_int, dates):
#     '''
#     visualize confidence intervals as bands around mean prediction line
#     '''
#     predictions = np.array(predictions).reshape(-1)
#     lower_bounds = np.array([ci[0] for ci in conf_int])
#     upper_bounds = np.array([ci[1] for ci in conf_int])
#     title = "Confidence Intervals for Predictions"
    
#     plt.figure(figsize=(10, 5))
#     plt.plot(dates, predictions, label='Predictions', color='blue', linewidth=2)
#     plt.fill_between(dates, lower_bounds, upper_bounds, color='blue', alpha=0.2, label='Confidence Interval')
    
#     plt.xlabel('X')
#     plt.ylabel('Prediction')
#     plt.title(title)
#     plt.legend()
#     plt.grid(True, linestyle='--', alpha=0.6)
#     plt.show()


def generate_date_range(start_date, num_days):
    """
    Generates a list of dates from a given start date.

    :param start_date: String in the format 'YYYY-MM-DD' representing the start date.
    :param num_days: Number of days to generate.
    :return: List of date strings.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    return [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(num_days)]
    

def predict(data, scaler):
    '''
    predict each ith data point 30 times, take average, append to data to predict i+1th point
    data structures:
        predictions: save simulated predictions to calculate confidence intervals
        data: data points to predict next data point with. updated after each prediction.

    end product:
        50 predicted daat points taken rom averaging each value over 30 simulations
    '''
    window_size = 50
    # sim_size = 30
    model = tf.keras.models.load_model("lstm_model.h5") 

    for i in range(window_size):
        point = model.predict(data)[0][0]
        point = scaler.inverse_transform(np.array(point).reshape(-1, 1)) #inverse transform to get original scale
        # predictions.append(point) #save simulated data for CI calculations
        data = append_new_point(data, point)

    return data

    
def main():
    '''
    Main function to run the prediction and visualization
    start/end date: 'YYYY-MM-DD'
    '''
    #data_sim is 2d list, each sublist is 30 simulations of same point - for use in CI calculations
    #data_avg is 1d list of average values for each point
    data = getPrice()
    start_date = data.pop(0) 
    scaler = load('scaler.joblib')  
    data = scaler.transform(preprocess_data(data))
    data = predict(data, scaler)
    # print(data)

    # Calculate confidence intervals
    # conf_int = evaluate(data_sim)

    # Visualize confidence intervals
    dates = generate_date_range(start_date, 50)
    # visualize_ci(data_avg, conf_int, dates)

    predictions = []
    for i in range(50):
        predictions.append((dates[i], data[i][0]))

    print(predictions[:10])
    return predictions
        

def save_scaler():
    '''
    Save the scaler to a file for later use
    Run if scaler.joblib file not already in directory
    '''
    STOCK = "AAPL"
    KEY = "BPBSUICJ7AGJ53KW"
    ts = TimeSeries(key=KEY, output_format='pandas')
    data, meta_data = ts.get_daily(symbol=STOCK, outputsize='full')

    # Ensure column names are correctly formatted
    data = data.rename(columns=lambda col: "Close" if "close" in col.lower() else col)

    # Save data to CSV
    data.to_csv("stock_market_data-AAPL.csv")
    scaler = StandardScaler()
    scaler.fit_transform(data[['Close']])

    dump(scaler, 'scaler.joblib')  # Save the scaler to a file


# save_scaler()
if __name__ == "__main__":
    main()


