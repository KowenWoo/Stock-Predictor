import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  SubTitle,
  Colors,
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // For date formatting
import { useState, useEffect, useRef } from 'react';
import { parseISO, format } from 'date-fns';


// TOD0:
// 1. Add a loading spinner when the data is being fetched
// 2. Process some additional info from the stock data so we can send them over 
// - and display them in the UI
// 3. Add some error handling in case the data fetching fail


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  Colors,
);

const StockChart = ({ data, symbol, onDataProcessed }) => {
  
  if (!data || !data.historical || !data.prediction) {
    return <div className="h-80 w-full bg-gray-100 animate-pulse rounded-lg"></div>;
  }
  
  

  
  const historicalDates = Object.keys(data.historical).sort();
  const predictionDates = Object.keys(data.prediction).sort();
  
  const lastPredictionDate = predictionDates[predictionDates.length - 1];
  const lastDate = parseISO(lastPredictionDate);

  // add some more dates on the chart so the prediction has some space to be shown
  // Edit this later so it is adjustable based on the amount of predicted data to be shwon
  const additionalDates = [];
  const numExtraDays = 29;
  for (let i = 1; i <= numExtraDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + i);
    
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    additionalDates.push(`${year}-${month}-${day}`);
  }

  
  const historicalPrices = historicalDates.map(date => {
    const closePrice = parseFloat(data.historical[date]['4. close']);
    return isNaN(closePrice) ? null : closePrice;
  });
  
  
  const predictionPrices = predictionDates.map(date => {
    return data.prediction[date]; // These should already be numbers
  });

  
  const chartData = {
    datasets: [
      {
        label: 'Historical',
        data: historicalDates.map((date, index) => ({
          x: date, // Keep as ISO string for consistent parsing
          y: historicalPrices[index]
        })),
        borderColor: '#eeeeee',
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '#eeeeee',
        pointRadius: 0,
        pointHoverRadius: 3,
        borderWidth: 2,
        tension: 0.3, 
        fill: false,
      },
      {
        label: 'Prediction',
        data: predictionDates.map((date, index) => ({
          x: date, // Keep as ISO string
          y: predictionPrices[index]
        })),
        borderColor: '#666666',
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '#666666',
        pointRadius: 0,
        pointHoverRadius: 2,
        borderWidth: 2.5,
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#eeeeee'
        }
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        titleColor: '#111',
        bodyColor: '#333',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(context) {
            if (context.length === 0) return '';
            const date = parseISO(context[0].raw.x);
            return format(date, 'MMM d, yyyy');
          },
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw.y;
            return `${datasetLabel}: $${value.toFixed(2)}`;
          }
        }
      },
      title: {
        display: false,
        text: `${symbol} Stock Price and Prediction`,
      },
    },
    elements: {
      line: {
        tension: 0.1,
        borderCapStyle: 'round'
      },
      point: {
        hitRadius: 10,
        hoverRadius: 4
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'yyyy-MM-dd', 
          unit: 'day',
          displayFormats: {
            day: 'MMM d'
          },
          tooltipFormat: 'MMM d, yyyy'
        },
        grid: {
          display: false
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8, 
          align: 'center',
          maxRotation: 0,
          minRotation: 0,
          color: '#eeeeee' 
        }
      },
      y: {
        position: 'right',
        grid: {
          display: false
        },
        ticks: {
          callback: function(value) {
            return `$${value.toFixed(2)}`;
          },
          count: 6,
          precision: 2,
          color: '#eeeeee' 
        },
        beginAtZero: false
      }
    }
  };

  return (
    <div className="p-4 bg-transparent rounded-lg w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;