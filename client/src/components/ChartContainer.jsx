import React, { useEffect, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart';

import {
  dateAxisFormatter,
  amountFormatter,
} from '../dataset/financial';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const withCreds = { withCredentials: true };

const ChartContainer = ({ type }) => {
  const { startDate, endDate, navigate } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get active shop headers
  const getHeaders = () => {
    const activeShopId = localStorage.getItem('activeShopId');
    if (!activeShopId) {
      toast.error('No active shop selected.');
      navigate('/');
      return null;
    }
    return { 'x-shop-id': activeShopId };
  };

  useEffect(() => {
    const fetchChartData = async () => {
      if (!startDate || !endDate) return;

      try {
        setLoading(true);
        const headers = getHeaders();
        if (!headers) return;

        const { data } = await axios.get(`/api/reports/${type.toLowerCase()}`, {
          headers,
          params: {
            start: startDate,
            end: endDate
          },
          ...withCreds
        });

        if (data.success) {
          // Convert string timestamps from JSON back into native JavaScript Date objects
          const formattedData = data.records.map((item) => {
            const localDateString = item.date.replace(/-/g, '/');

            return {
              ...item,
              date: new Date(localDateString),
            };
          });
          
          setChartData(formattedData);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [type, startDate, endDate]); 

  const currentFormatter = type === 'orders' 
    ? (value) => `${value} units` 
    : amountFormatter;

  const xAxis = [
    {
      dataKey: 'date',
      scaleType: 'time',
      valueFormatter: dateAxisFormatter,
    },
  ];

  const yAxis = [
    {
      valueFormatter: currentFormatter, 
    },
  ];

  const series = [
    {
      dataKey: 'amount',
      valueFormatter: currentFormatter,
      label: type.toUpperCase(),
      color: '#3b82f6',
      curve: 'linear'
    },
  ];

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart data...</div>;
  }

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

export default ChartContainer;