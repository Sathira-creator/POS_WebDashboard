import React, { useState } from 'react'
import StatCard from '../components/StatCard'
import ChartContainer from '../components/ChartContainer'
import DateRangePicker from '../components/DateRangePicker';
import ChartCard from '../components/ChartCard';
import BarchartCard from '../components/BarchartCard';


const ReportPage = () => {

  const [activeType, setActiveType] = useState('sales');
  console.log('Active Type:', activeType); // Debugging line to check state updates
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      {/* 2. Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Sales" value="Rs. 1,340,000.00" color="bg-green-100" icon="💰" textColor="text-green-600" onClick={() => setActiveType('sales')} />
        <StatCard label="Orders" value="689" color="bg-orange-100" icon="#" textColor="text-orange-600" onClick={() => setActiveType('orders')} />
        <StatCard label="Average Order Value" value="Rs. 907.00" color="bg-red-100" icon="%" textColor="text-red-600" onClick={() => setActiveType('AOV')} />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8 items-start">
        {/* Sales Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{activeType}</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ChartContainer type={activeType} />
        </div>

        {/* 2. Calendar Sidebar (Right side) */}
        <div className="col-span-12 lg:col-span-4 self-start"> 
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4">
            <h4 className="font-bold text-sm mb-4 text-gray-500">Select Date Range</h4>
            <DateRangePicker />
          </div>
        </div>

        {/* 4. Bottom Grid Pie Charts */}
        <div className="col-span-12 mt-4"> 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <ChartCard title="Payment_Method" />
            <ChartCard title="Category" />
            <ChartCard title="Time_Period" />
          </div>
        </div>

        {/* bar charts */}
        <div className="col-span-12 mt-4"> 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            <BarchartCard type="topSelling"/>
            <BarchartCard type="topEmployees" />
          </div>
        </div>


      </div>

    </div>
  )
}

export default ReportPage