import React from 'react';
import { format } from 'date-fns';

const Metrics = ({ chartData, symbol }) => {
  if (!chartData) {
    return (
      <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
        <h2 className="text-xl font-semibold mb-4">Stock Metrics</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-3/4 bg-gray-700/40 rounded"></div>
          <div className="h-5 w-1/2 bg-gray-700/40 rounded"></div>
          <div className="h-5 w-2/3 bg-gray-700/40 rounded"></div>
        </div>
      </div>
    );
  }

  const {
    latestHistoricalDate,
    latestHistoricalPrice,
    latestPredictionDate,
    latestPredictionPrice,
    priceChange,
    percentChange
  } = chartData;

  // Format dates for display
  const formattedHistDate = latestHistoricalDate ? 
    format(new Date(latestHistoricalDate), 'MMM d, yyyy') : '-';
  const formattedPredDate = latestPredictionDate ? 
    format(new Date(latestPredictionDate), 'MMM d, yyyy') : '-';

  // Determine color based on prediction trend
  const trendColor = percentChange >= 0 ? 'text-green-500' : 'text-[#AE2F2F]';
  const trendIcon = percentChange >= 0 ? '▲' : '▼';

  return (
    <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
      <h2 className="text-xl font-semibold mb-4">Stock Metrics</h2>
      
      {/* Current Price */}
      <div className="mb-4">
        <div className="text-sm text-gray-400">Latest Price ({formattedHistDate})</div>
        <div className="text-2xl font-bold">${latestHistoricalPrice?.toFixed(2)}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-400">Predicted Price ({formattedPredDate})</div>
        <div className="text-2xl font-bold">${latestPredictionPrice?.toFixed(2)}</div>
        <div className={`text-sm ${trendColor} font-medium`}>
          {trendIcon} ${Math.abs(priceChange).toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-400">
        <div>Prediction Period</div>
        <div className="text-white">
          {formattedHistDate} to {formattedPredDate}
          <span className="text-gray-400 ml-2">
            ({Math.floor((new Date(latestPredictionDate) - new Date(latestHistoricalDate)) / (1000 * 60 * 60 * 24))} days)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Metrics;