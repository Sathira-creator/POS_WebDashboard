import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import DateRangePicker from '../components/DateRangePicker';
import ChartCard from '../components/ChartCard';
import BarchartCard from '../components/BarchartCard';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const withCreds = { withCredentials: true };

const ReportPage = () => {
  const { startDate, endDate, navigate } = useAppContext();
  const [activeType, setActiveType] = useState('sales');
  const [sales, setSales] = useState(0);
  const [orders, setOrders] = useState(0);
  const [aov, setAov] = useState(0);

  // Helper to get active shop headers (same pattern as InventoryPage)
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
    const fetchStatcardData = async () => {
      if (!startDate || !endDate) return;

      try {
        const headers = getHeaders();
        if (!headers) return;

        const { data } = await axios.get('/api/reports/statdata', {
          headers,
          params: {
            start: startDate,
            end: endDate,
          },
          ...withCreds,
        });

        if (data.success) {
          setSales(data.sales);
          setOrders(data.orders);
          setAov(data.aov);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    };

    fetchStatcardData();
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          label="Total Sales" 
          value={`$${(sales || 0).toFixed(2)}`} 
          color="bg-emerald-50 border border-emerald-100" 
          icon="💰" 
          textColor="text-emerald-600" 
          onClick={() => setActiveType('sales')} 
        />
        <StatCard 
          label="Orders" 
          value={orders || 0} 
          color="bg-amber-50 border border-amber-100" 
          icon="#" 
          textColor="text-amber-600" 
          onClick={() => setActiveType('orders')} 
        />
        <StatCard 
          label="Average Order Value" 
          value={`$${(aov || 0).toFixed(2)}`} 
          color="bg-blue-50 border border-blue-100" 
          icon="%" 
          textColor="text-blue-600" 
          onClick={() => setActiveType('AOV')} 
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8 items-start">
        
        {/* Sales Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-[#0D1B2A] capitalize">{activeType} Trend Analysis</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:border-[#0070F3] transition-colors cursor-pointer">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ChartContainer type={activeType} />
        </div>

        {/* Calendar Sidebar (Right side) */}
        <div className="col-span-12 lg:col-span-4 self-start">
          <div className="bg-white shadow-xl border border-gray-100 rounded-3xl p-6">
            <h4 className="font-black text-sm mb-4 text-[#0D1B2A] uppercase tracking-wider">Select Date Range</h4>
            <DateRangePicker />
          </div>
        </div>

      </div>

      {/* Bottom Grid Pie/Distribution Charts */}
      <div className="mb-8">
        <h3 className="font-black text-lg text-[#0D1B2A] mb-4">Performance Breakdowns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <ChartCard title="Payment_Method" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <ChartCard title="Category" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <ChartCard title="Time_Period" />
          </div>
        </div>
      </div>

      {/* Bar charts Section */}
      <div className="mb-12">
        <h3 className="font-black text-lg text-[#0D1B2A] mb-4">Top Rankings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <BarchartCard type="topSelling" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <BarchartCard type="topEmployees" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportPage;