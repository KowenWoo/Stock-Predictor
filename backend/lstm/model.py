"""
LSTM model for time series forecasting trained on Google Colab: 
https://colab.research.google.com/drive/14b6nR3UrAH46HE0I7HhbE4o1ST0yAKH6#scrollTo=jboL2ugAVKJD
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from test_model import getPrice

# Preprocessing Function
def preprocess_data(prices, window_size=50):
    prices = np.array(prices).reshape(1, window_size, 1)
    print(prices)  # Reshape for model input
    return prices

def evaluate():
    #TODO: create evaluation metrics for future forecasting
    return

def predict():
    window_size = 50
    model = tf.keras.models.load_model("lstm_model.h5") 
    
    #TODO: retrieve last 50 data points (seed data)
    #data = get_data_from_api()  # Replace with actual data retrieval

    for i in range(window_size):
        input_data = preprocess_data(data["prices"])

        #predict next data point
        y_hat = model.predict(input_data)[0][0]

        #append this predicted value to seed data
        data.append(y_hat)

    #return last window_size data points (predicted data)
    return data[-window_size:]



if __name__ == "__main__":
    main()

