import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { parseISO, format } from 'date-fns';


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
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600 p-3 rounded-lg shadow-2xl">
        <p className="text-gray-300 font-semibold text-sm mb-2">{formattedDate}</p>
        {payload.map((entry) => {
          if (entry.value === null) return null;

          const isHistorical = entry.name.includes('Historical');
          const displayName = isHistorical ? 'Historical' : 'Predicted';
          const color = entry.stroke || '#fff';

          return (
            <div key={entry.name} className="flex items-center justify-between mt-1 text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-400 mr-2">{displayName}:</span>
              </div>
              <span className="text-white font-bold">${entry.value.toFixed(2)}</span>
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
    <div className="w-full h-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis
            dataKey="date"
            angle={-45}
            tick={{ fill: '#DAD7CD', fontSize: 12 }}
            tickCount={8}
            tickFormatter={date => {
              try {
                return format(parseISO(date), 'MMM d');
              } catch (err) {
                return date;
              }
            }}
            height={60}
            dy={10}
            stroke="#555"
          />
          <YAxis
            orientation="right"
            tickFormatter={value => `$${value.toFixed(0)}`}
            tick={{ fill: '#DAD7CD', fontSize: 12 }}
            dx={10}
            stroke="#555"
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />

          {transitionDate && (
            <ReferenceLine
              x={transitionDate}
              stroke="#888"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Today',
                position: 'top',
                fill: '#DAD7CD',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          )}

          <Line
            name="Historical Price"
            type="monotone"
            dataKey="historical"
            stroke="#ffffff"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: '#fff', strokeWidth: 2 }}
            connectNulls
          />
          <Line
            name="Predicted Price"
            type="monotone"
            dataKey="prediction"
            stroke={predictionColor}
            strokeWidth={3}
            strokeDasharray="8 4"
            dot={false}
            activeDot={{ r: 5, fill: predictionColor, strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;