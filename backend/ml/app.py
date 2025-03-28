from flask import Flask, request, jsonify
import torch
from model import TCN  
import numpy as np
from flask_cors import CORS  
from predfuncs import prepare_data_for_model, generate_future_dates

app = Flask(__name__)
CORS(app) 

models = {
    'AAPL': None
}

# Load models on startup
def load_models():
    try:
        for ticker in models.keys():
            models[ticker] = TCN(
                input_size=1,
                output_size=1,
                num_channels=[32, 64, 128],
                kernel_size=3,
                dropout=0.2
            )
            models[ticker].load_state_dict(torch.load(f"models/{ticker.lower()}_model.pth"))
            models[ticker].eval()
        print("Models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")

load_models()


@app.route('/predict/<ticker>', methods=['POST']) #quick note: POST is used here because we are sending data to the server
def predict(ticker):
    if ticker not in models:
        return jsonify({"error": f"Model for {ticker} not available"}), 404
    
    if models[ticker] is None:
        return jsonify({"error": f"Model for {ticker} not loaded properly"}), 500
    

    # Get the predction here by passing it to the model
    predictions = [189.0, 190.0, 191.0, 192.0, 193.0, 194.0, 195.0, 189.0, 200, 231.0, 212.0, 203.0, 194.0, 195.0,] # place holder, replace with actual prediction by calling the model

    try:
        data = request.json
        if ('last_date' not in data) or ('historical_data' not in data):
            return jsonify({"error": "Invalid input data"}), 400
        last_date = data['last_date']  # Expecting ISO format
        future_dates = generate_future_dates(last_date, len(predictions))
        predicition_dict = {date: float(pred) for date, pred in zip(future_dates, predictions)}
        
        return jsonify({
            "ticker": 'AAPL',
            "predictions": predicition_dict
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# util to check what models are available
@app.route('/models', methods=['GET'])
def available_models():
    """List available models"""
    return jsonify({
        "available_models": list(models.keys()),
        "loaded": {k: v is not None for k, v in models.items()}
    })

if __name__ == '__main__':
    app.run(port=5000)    


