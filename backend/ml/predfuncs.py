def prepare_data_for_model(data, window_size):
    """Prepare input data for prediction"""
    # Use your existing preparation logic from data_pipeline.py
    # This should create sequences of the correct window_size
    sequences = []
    for i in range(len(data) - window_size + 1):
        sequences.append(data[i:i+window_size])
    return np.array(sequences)

def generate_future_dates(last_date, num_days):
    """
    Generate future dates from the last available date
    QUICK NOTE:
            --> No Weekend Dates (Saturday and Sunday) so
            0,1,2,3,4,5,6 = Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
            skip 5 and 6 since no trading on weekends
    """
    from datetime import datetime, timedelta
    
    base_date = datetime.fromisoformat(last_date.split('T')[0])
    future_dates = []
    
    for i in range(1, num_days + 1):
        days_to_add = i
        new_date = base_date + timedelta(days=days_to_add)
        while new_date.weekday() > 4:  # Skip Saturday (5) and Sunday (6)
            new_date = new_date + timedelta(days=1)
            
        future_dates.append(new_date.strftime("%Y-%m-%d"))
        
    return future_dates