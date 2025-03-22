TICKER = "AAPL"
KEY = "BPBSUICJ7AGJ53KW"

config = {
    "alpha_vantage": {
        "key": KEY,
        "symbol": TICKER,
        "outputsize": "full",
        "key_close": "4. close",
    },
    "data": {
        "window_size": 20,
        "train_split_size": 0.80,
    }, 
    "plots": {
        "xticks_interval": 90,
        "color_actual": "#001f3f",
        "color_train": "#3D9970",
        "color_val": "#0074D9",
        "color_pred_train": "#3D9970",
        "color_pred_val": "#0074D9",
        "color_pred_test": "#FF4136",
    },
    "training": {
        "device": "cpu",
        "batch_size": 64,
        "num_epoch": 100,
        "learning_rate": 0.01,
        "scheduler_step_size": 40
    },
    "apple": {
            "input_size": 1,
            "output_size": 1,
            "channels": [32, 64, 128],
            "kernel_size": 3,
            "dilation_base": 2,
            "num_layers": 3,
            "input_length": 20,
            
        }
}
