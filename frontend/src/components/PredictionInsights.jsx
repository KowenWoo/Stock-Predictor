import React from 'react';

const PredictionInsights = ({ chartData, symbol }) => {
  if (!chartData) {
    return (
      <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
        <h2 className="text-xl font-semibold mb-4">Prediction Insights</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-3/4 bg-gray-700/40 rounded"></div>
          <div className="h-5 w-1/2 bg-gray-700/40 rounded"></div>
          <div className="h-5 w-2/3 bg-gray-700/40 rounded"></div>
        </div>
      </div>
    );
  }

  const { percentChange } = chartData;
  
  // Generate insights based on prediction data
  const getTrendAnalysis = () => {
    if (percentChange > 10) {
      return {
        title: "Strong Bullish Trend",
        description: `${symbol} shows a significant upward trend with a projected increase of ${percentChange.toFixed(2)}%. This suggests strong positive momentum for the stock.`,
        icon: "",
        color: "text-green-500"
      };
    } else if (percentChange > 0) {
      return {
        title: "Moderate Bullish Trend",
        description: `${symbol} displays a moderate upward trend with a projected gain of ${percentChange.toFixed(2)}%. The stock appears to be maintaining positive momentum.`,
        icon: "",
        color: "text-green-400"
      };
    } else if (percentChange > -5) {
      return {
        title: "Slight Bearish Trend",
        description: `${symbol} shows a slight downward trend with a projected decrease of ${Math.abs(percentChange).toFixed(2)}%. The stock may be experiencing minor profit-taking or market adjustment.`,
        icon: "",
        color: "text-yellow-500"
      };
    } else {
      return {
        title: "Strong Bearish Trend",
        description: `${symbol} displays a significant downward trend with a projected decline of ${Math.abs(percentChange).toFixed(2)}%. The stock may be facing selling pressure or negative market sentiment.`,
        icon: "",
        color: "text-[#AE2F2F]"
      };
    }
  };

  const trendAnalysis = getTrendAnalysis();
  const getTradingSignal = () => {
    if (percentChange > 8) return "Strong Buy";
    if (percentChange > 3) return "Buy";
    if (percentChange >= -3 && percentChange <= 3) return "Hold";
    if (percentChange >= -8 && percentChange < -3) return "Sell";
    return "Strong Sell";
  };

  const tradingSignal = getTradingSignal();
  const signalColorClass = 
    tradingSignal.includes("Buy") ? "text-green-500" : 
    tradingSignal === "Hold" ? "text-yellow-500" : "text-[#AE2F2F]";
  return (
    <div className="p-6 rounded-lg shadow-xl border-2 border-black/15 backdrop-blur-xs">
      <h2 className="text-xl font-semibold mb-4">Prediction Insights</h2>
      <div className="mb-4">
        <div className={`text-lg font-medium ${trendAnalysis.color} flex items-center`}>
          <span className="mr-2">{trendAnalysis.icon}</span>
          {trendAnalysis.title}
        </div>
        <p className="text-sm mt-1 text-gray-300">{trendAnalysis.description}</p>
      </div>
      <div className="mt-6">
        <div className="text-sm text-gray-400 mb-1">AI Trading Signal</div>
        <div className={`text-lg font-bold ${signalColorClass}`}>{tradingSignal}</div>
        <div className="text-xs text-gray-400 mt-1">
          *Based on predicted price movement and trend analysis
        </div>
      </div>
    </div>
  );
};

export default PredictionInsights;