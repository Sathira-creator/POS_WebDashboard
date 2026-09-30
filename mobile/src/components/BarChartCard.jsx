import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const BarChartCard = ({ type }) => {
  const { startDate, endDate } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchBarData = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'topEmployees' ? '/api/reports/top-employees' : '/api/reports/top-selling';
        const { data } = await axios.get(endpoint, {
          params: { start: startDate, end: endDate },
        });

        if (data.success) {
          const formatted = (data.records || []).map((item) => ({
            value: type === 'topEmployees' ? item.performanceScore : item.quantitySold,
            label: type === 'topEmployees' ? item.employee : item.product,
            frontColor: type === 'topEmployees' ? '#8b5cf6' : '#3b82f6',
          }));
          setChartData(formatted);
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: data.message || 'Failed to fetch bar chart data' });
        }
      } catch (error) {
        console.error('Error loading bar chart data:', error);
        Toast.show({ type: 'error', text1: 'Network Error', text2: error.message });
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchBarData();
    }
  }, [type, startDate, endDate]);

  const title = type === 'topEmployees' ? 'Top Employees' : 'Top Selling Products';

  return (
    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 w-full mb-4">
      <Text className="font-bold text-base mb-4 text-gray-700">{title}</Text>
      
      <View className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 items-center justify-center">
        {loading ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : chartData.length === 0 ? (
          <Text className="text-gray-400 text-xs py-10">No data available</Text>
        ) : (
          <BarChart
            data={chartData}
            barWidth={24}
            spacing={16}
            roundedTop
            xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10, textAlign: 'center' }}
            yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
            noOfSections={4}
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(i => i.value)) * 1.2 : 10}
            isAnimated
            animationDuration={1000}
            rulesColor="#e5e7eb"
          />
        )}
      </View>
    </View>
  );
};

export default BarChartCard;