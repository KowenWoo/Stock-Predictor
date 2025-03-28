'''
retrain model every 50 days
'''
import tensorflow as tf
import numpy as np
import pandas as pd

def main():
    model = tf.keras.models.load_model("lstm_model.h5")

    # Retrieve current data from API