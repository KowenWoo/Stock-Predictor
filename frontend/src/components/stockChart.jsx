import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { parseISO, format } from 'date-fns';


// TOD0:
// 1. Add a loading spinner when the data is being fetched
// 2. Process some additional info from the stock data so we can send them over 
// - and display them in the UI
// 3. Add some error handling in case the data fetching fail


// Progress:
// Moved to RECHARTS CAUSE CHARTJS WAS BEING A BITCH
// - Added some error handling
// - moved additional info into a seperate file


const StockChart = ({ data, symbol, onDataProcessed }) => {
  const [processedData, setProcessedData] = useState([]);
  
  // Show loading state if data isn't available yet
  if (!data || !data.historical || !data.prediction) {
    return <div className="h-80 w-full bg-gray-800/30 animate-pulse rounded-lg"></div>;
  }
  
  useEffect(() => {
    const formattedData = [];
    let historicalDates = [];
    let predictionDates = [];
    
    try {
      historicalDates = Object.keys(data.historical || {});
      predictionDates = Object.keys(data.prediction || {});
      
      historicalDates.forEach(date => {
        const entry = data.historical[date];
        if (entry && entry['4. close']) {
          formattedData.push({
            date,
            historical: parseFloat(entry['4. close']),
            prediction: null
          });
        }
      });
      
      predictionDates.forEach(date => {
        const value = data.prediction[date];
        const existingIndex = formattedData.findIndex(item => item.date === date);
        
        if (existingIndex >= 0) {
          formattedData[existingIndex].prediction = parseFloat(value);
        } else {
          formattedData.push({
            date,
            historical: null,
            prediction: parseFloat(value)
          });
        }
      });
      
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Find the last point with historical data to connect the prediction line
      const lastHistoricalIndex = formattedData.findLastIndex(d => d.historical !== null);

      if (lastHistoricalIndex !== -1) {
        const lastHistoricalPoint = formattedData[lastHistoricalIndex];
        // Set the prediction value to be the same as historical to connect the lines
        formattedData[lastHistoricalIndex] = {
            ...lastHistoricalPoint,
            prediction: lastHistoricalPoint.historical,
        };
      }
      
      setProcessedData(formattedData);
      
      // Calculate metrics for callback
      if (formattedData.length > 0 && onDataProcessed) {
        const lastHistoricalEntry = [...formattedData]
          .filter(item => item.historical !== null)
          .pop();
          
        const lastPredictionEntry = [...formattedData]
          .filter(item => item.prediction !== null)
          .pop();
          
        if (lastHistoricalEntry && lastPredictionEntry) {
          const metricsData = {
            latestHistoricalDate: lastHistoricalEntry.date,
            latestHistoricalPrice: lastHistoricalEntry.historical,
            latestPredictionDate: lastPredictionEntry.date,
            latestPredictionPrice: lastPredictionEntry.prediction,
            priceChange: lastPredictionEntry.prediction - lastHistoricalEntry.historical,
            percentChange: ((lastPredictionEntry.prediction - lastHistoricalEntry.historical) / lastHistoricalEntry.historical) * 100
          };
          
          onDataProcessed(metricsData);
        }
      }
    } catch (err) {
      console.error("Error processing chart data:", err);
    }
  }, [data, onDataProcessed]);
  
  // no data
  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-800/20 rounded-lg">
        <p className="text-gray-400">No data available to display</p>
      </div>
    );
  }
  
  // Make custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    let formattedDate;
    try {
      formattedDate = format(parseISO(label), 'MMM d, yyyy');
    } catch (err) {
      formattedDate = label;
    }
    
    return (
      <div className=" border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium">{formattedDate}</p>
        {payload.map((entry) => {
          if (entry.value === null) return null;
          
          const isHistorical = entry.name === 'historical';
          const color = isHistorical ? 'white' : (entry.value > processedData[0].historical ? 'rgb(74, 222, 128)' : 'rgb(239, 68, 68)');
          
          return (
            <div key={entry.name} className="flex items-center mt-1 text-white text-sm">
              <div className="w-2 h-2 rounded-full mr-2 bg-amber-950"></div>
              <span>Price: ${entry.value.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Find the transition point date
  const transitionDate = processedData.find(d => d.historical !== null && d.prediction !== null)?.date;
  
  // Set prediction color
  const isPredictionPositive = 
    processedData[processedData.length - 1]?.prediction > 
    processedData.find(d => d.historical !== null && d.prediction === null)?.historical;
  
  const predictionColor = isPredictionPositive ? "#4ade80" : "#ef4444";
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid horizontal={false} vertical={false} />
          <XAxis
            dataKey="date"
            angle = {315}
            tick={{ fill: '#eee' }}
            tickCount={5}
            tickFormatter={date => {
              try {
                return format(parseISO(date), 'MMM d');
              } catch (err) {
                return date;
              }
            }}
            dy={10}
          />
          <YAxis
            orientation="right"
            tickFormatter={value => `$${value}`}
            tick={{ fill: '#eee' }}
            dx={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {transitionDate && (
            <ReferenceLine
              x={transitionDate}
              stroke="#666"
              strokeDasharray="3 3"
              label={{ value: 'Now', position: 'top', fill: '#999' }}
            />
          )}
          
          <Line
            name="Historical"
            type="monotone"
            dataKey="historical"
            stroke="#eeeeee"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#fff' }}
            connectNulls
          />
          <Line
            name="Prediction"
            type="monotone"
            dataKey="prediction"
            stroke={predictionColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 3, fill: predictionColor }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;