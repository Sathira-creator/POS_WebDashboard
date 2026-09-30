import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';


// const categoryData = [
//   { label: 'Grocery', value: 55000, color: '#0088FE' },
//   { label: 'Bakery', value: 32000, color: '#00C49F' },
//   { label: 'Beverages', value: 21000, color: '#FFBB28' },
//   { label: 'Household', value: 15000, color: '#FF8042' },
//   { label: 'Other', value: 8000, color: '#8884d8' },
// ];

// const paymentMethodData = [
//   { label: 'Cash', value: 75000, color: '#4caf50' }, // Green for cash
//   { label: 'Credit/Debit Card', value: 45000, color: '#2196f3' }, // Blue for Visa/Master
//   { label: 'online', value: 12000, color: '#9c27b0' }, // Purple for digital
// ];

// const timePeriodData = [
//   { label: 'Morning (6am-11am)', value: 25000, color: '#ffeb3b' },
//   { label: 'Lunch (11am-3pm)', value: 48000, color: '#f44336' },
//   { label: 'Evening (3pm-8pm)', value: 52000, color: '#3f51b5' },
//   { label: 'Night (8pm-11pm)', value: 18000, color: '#263238' },
// ];


const settings = {
  margin: { right: 5 },
  width: 200,
  height: 200,
  hideLegend: true,
};


const ChartCard = ({title}) => {

  const { startDate, endDate, navigate } = useAppContext();
  
  const [paymentData, setPaymentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timePeriodData, setTimePeriodData] = useState([]);
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

  const handlePieData = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const headers = getHeaders();
      if (!headers) return;

      const { data } = await axios.get('/api/reports/pie', {
        headers,
        params: {
          start: startDate,
          end: endDate
        },
        withCredentials: true
      });

      if (data.success) {
        setPaymentData(data.paymentData || []);
        setCategoryData(data.categoryData || []);
        setTimePeriodData(data.timePeriodData || []);
        console.log("Pie chart data fetched successfully:", data);
      } else {
        toast.error(data.message || "Failed to load pie chart data");
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePieData();
  }, [startDate, endDate]);

  let data = [];
  if (title === 'Category') data = categoryData;
  else if (title === 'Payment_Method') data = paymentData;
  else if (title === 'Time_Period') data = timePeriodData;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-md mb-4">Sales By {title}</h3>
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
            {loading ? (
              <span className="text-gray-400 text-sm">Loading...</span>
            ) : (
              <PieChart
                  series={[{ innerRadius: 50, outerRadius: 100, data, arcLabel: 'value' }]}
                  {...settings}
              />
            )}
        </div>
    </div>
  )
}

export default ChartCard;