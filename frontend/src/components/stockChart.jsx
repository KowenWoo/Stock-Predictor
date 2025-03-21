import { Line } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import 'chartjs-adapter-date-fns';
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
    Colors
} from 'chart.js';


const stockchart = () => {
  return (
    <div>
      <h1>Stock Chart</h1>
    </div>
  );
}