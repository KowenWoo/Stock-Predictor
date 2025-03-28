'''
retrain model every 50 days
'''
import tensorflow as tf
import numpy as np
import pandas as pd

def main():
    model = tf.keras.models.load_model("lstm_model.h5")

    #TODO: Retrieve current data from API

    #TODO: Preprocess data

    #TODO: Train model

    #TODO: delete old mode, save new one with same name so other files can still access