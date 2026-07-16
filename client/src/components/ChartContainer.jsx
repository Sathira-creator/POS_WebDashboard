import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart';

import {
  dateAxisFormatter,
  amountFormatter,
  salesData,
  ordersData,
  aovData
} from '../dataset/financial';



const ChartContainer = ({type}) => {
  const getDataset = () => {
    if (type === 'orders') return ordersData;
    if (type === 'AOV') return aovData;
    return salesData; // default to sales
  };

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
      dataset={getDataset()}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      height={300}
      grid={{ vertical: true, horizontal: true }}
    />
  )
}

export default ChartContainer