

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

const StockChart = ({ data, symbol }) => {
  // If no data yet, show loading placeholder
  if (!data || !data.historical || !data.prediction) {
    return <div className="h-80 w-full bg-gray-100 animate-pulse rounded-lg"></div>;
  }
  const historicalDatesKnonwn = Object.keys(data.historical).sort();
  const predictionDatesKnown = Object.keys(data.prediction).sort();
  const last = new Date(predictionDatesKnown[predictionDatesKnown.length - 1]);

  const additonalDate = [];
  const numExtraDays = 29;
  for (let i = 1; i <= numExtraDays; i++) {
    const futureDate = new Date(last);
    futureDate.setDate(last.getDate() + i);

    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    additonalDate.push(`${year}-${month}-${day}`);
  }

  // Format dates and prices for chart
  const dates = [...historicalDatesKnonwn.map(date => new Date(date).toLocaleDateString()), 
                 ...predictionDatesKnown.map(date => new Date(date).toLocaleDateString()),
                 ...additonalDate.map(date => new Date(date).toLocaleDateString())];
  
  const historicalPrices = Object.values(data.historical).map(day => parseFloat(day['4. close']));
  const predictionPrices = Object.values(data.prediction);
  
  // Create empty spaces between historical and prediction data
  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Historical',
        data: [...historicalPrices, ...Array(predictionPrices.length).fill(null)],
        borderColor: '#eeeeee',
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '#eeeeee',
        pointRadius: 0,
        pointHoverRadius: 3,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        cubicInterpolationMode: 'monotone',
      },
      {
        label: 'Prediction',
        data: [
          ...Array(historicalPrices.length).fill(null), 
          ...predictionPrices,
          ...Array(additonalDate.length).fill(null)
        ],
        borderColor: '#666666',
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '#666666',
        pointRadius: 0,
        pointHoverRadius: 2,
        borderWidth: 2.5,
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        cubicInterpolationMode: 'monotone'
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
    animations:{
      tension:{
        duration: 1000,
        easing: 'linear'
      }
    },
    plugins: {
      legend: {
        position: 'top-left',
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
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
          },
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
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
        tension: 0.2,
        cubicInterpolationMode: 'monotone',
        borderCapStyle: 'round'
      },
      point: {
        hitRadius: 30,
        hoverRadius: 5
      }
    },
    scales: {
      x:{
        type: 'time',
        time: {
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
          maxTicksLimit: 10,
          align: 'center',
          maxRotation: 0,
          minRotation: 0
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
          precision: 2
        },
        beginAtZero: false
      }
    }
  };

  return (
    <div className="p-4 bg-transparent rounded-lg shadow-md w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;