import * as React from 'react';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { BarChart } from '@mui/x-charts/BarChart';
import { pointsFormatter, quantityFormatter, topEmployees, topSelling} from '../dataset/barData';


const BarchartCard = ({type}) => {
  const chartConfig = type === 'topEmployees' ? {
    dataset: topEmployees,
    xAxisKey: 'employee',
    seriesKey: 'performanceScore',
    seriesLabel: 'Employee Performance',
    yAxisLabel: 'Points',
    formatter: pointsFormatter
  } : {
    dataset: topSelling,
    xAxisKey: 'product',
    seriesKey: 'quantitySold',
    seriesLabel: 'Top Products',
    yAxisLabel: 'Units Sold',
    formatter: quantityFormatter
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full">
      <h3 className="font-bold text-md mb-4 text-gray-700">
        {type === 'topEmployees' ? 'Top Employees' : 'Top Selling Products'}
      </h3>
      <div className="w-full overflow-x-auto">
        <BarChart
          dataset={chartConfig.dataset}
          xAxis={[
            { 
              scaleType: 'band', 
              dataKey: chartConfig.xAxisKey,
              tickLabelStyle: { angle: 30, textAnchor: 'start', fontSize: 11 } // Tilts text labels so long names don't overlap
            }
          ]}
          series={[
            { 
              dataKey: chartConfig.seriesKey, 
              label: chartConfig.seriesLabel, 
              valueFormatter: chartConfig.formatter 
            }
          ]}
          yAxis={[{ label: chartConfig.yAxisLabel }]}
          height={320}
        />
      </div>
    </div>
  )
}

export default BarchartCard