import React, { useEffect, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart';

import {
  dateAxisFormatter,
  amountFormatter,
  salesData,
  ordersData,
  aovData
} from '../dataset/financial';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';



const ChartContainer = ({type}) => {

  const {startDate, endDate} = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/reports/${type.toLowerCase()}`, {
          params: {
            start: startDate,
            end: endDate
          }
        });
        if (data.success) {
          // Convert string timestamps from JSON back into native JavaScript Date objects
          
          const formattedData = data.records.map((item) => {
            // 💡 Opened proper curly braces here to allow statement declarations
            const localDateString = item.date.replace(/-/g, '/');

            return {
              ...item,
              date: new Date(localDateString),
            };
          });
          
          setChartData(formattedData);
          
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchChartData();
    }
  }, [type, startDate, endDate]); 
    

  const currentFormatter = type === 'orders' 
    ? (value) => `${value} units` 
    : amountFormatter;

  // 3. Move configurations INSIDE the component
  const xAxis = [
    {
      dataKey: 'date',
      scaleType: 'time',
      valueFormatter: dateAxisFormatter,
    },
  ];

  const yAxis = [
    {
      valueFormatter: currentFormatter, // Now updates dynamically
    },
  ];

  const series = [
    {
      dataKey: 'amount',
      valueFormatter: currentFormatter, // Now updates dynamically
      label: type.toUpperCase(),
      color: '#3b82f6',
      curve: 'linear'
    },
  ];

  return (
    <LineChart
      dataset={chartData}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      height={300}
      grid={{ vertical: true, horizontal: true }}
    />
  )
}

export default ChartContainer