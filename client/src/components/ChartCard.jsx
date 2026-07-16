import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const categoryData = [
  { label: 'Grocery', value: 55000, color: '#0088FE' },
  { label: 'Bakery', value: 32000, color: '#00C49F' },
  { label: 'Beverages', value: 21000, color: '#FFBB28' },
  { label: 'Household', value: 15000, color: '#FF8042' },
  { label: 'Other', value: 8000, color: '#8884d8' },
];

const paymentMethodData = [
  { label: 'Cash', value: 75000, color: '#4caf50' }, // Green for cash
  { label: 'Credit/Debit Card', value: 45000, color: '#2196f3' }, // Blue for Visa/Master
  { label: 'QR / Digital Wallet', value: 12000, color: '#9c27b0' }, // Purple for digital
  { label: 'Bank Transfer', value: 5000, color: '#ff9800' }, // Orange for transfers
];

const timePeriodData = [
  { label: 'Morning (6am-11am)', value: 25000, color: '#ffeb3b' },
  { label: 'Lunch (11am-3pm)', value: 48000, color: '#f44336' },
  { label: 'Evening (3pm-8pm)', value: 52000, color: '#3f51b5' },
  { label: 'Night (8pm-11pm)', value: 18000, color: '#263238' },
];


const settings = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};


const ChartCard = ({title}) => {
    let data = [];
    if (title === 'Category') data = categoryData;
    else if (title === 'Payment_Method') data = paymentMethodData;
    else if (title === 'Time_Period') data = timePeriodData;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-md mb-4">Sales By {title}</h3>
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
            <PieChart
                series={[{ innerRadius: 50, outerRadius: 100, data, arcLabel: 'value' }]}
                {...settings}
            />
        </div>
    </div>
  )
}

export default ChartCard