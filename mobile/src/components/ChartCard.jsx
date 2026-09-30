import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ChartCard = ({ title }) => {
  const { startDate, endDate } = useAppContext();
  
  const [paymentData, setPaymentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timePeriodData, setTimePeriodData] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const getHeaders = async () => {
    const activeShopId = await SecureStore.getItemAsync('activeShopId');
    if (!activeShopId) {
      Toast.show({
        type: 'error',
        text1: 'Access Error',
        text2: 'No active shop selected.',
        position: 'top',
      });
      return null;
    }
    return { 'x-shop-id': activeShopId };
  };

  const handlePieData = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const headers = await getHeaders();
      if (!headers) return;

      const { data } = await axios.get('/api/reports/pie', {
        headers,
        params: {
          start: startDate,
          end: endDate,
        },
      });

      if (data.success) {
        setPaymentData(data.paymentData || []);
        setCategoryData(data.categoryData || []);
        setTimePeriodData(data.timePeriodData || []);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to load pie chart data',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePieData();
  }, [startDate, endDate]);

  let rawData = [];
  if (title === 'Category') rawData = categoryData;
  else if (title === 'Payment_Method') rawData = paymentData;
  else if (title === 'Time_Period') rawData = timePeriodData;

  // Format data for react-native-gifted-charts (requires 'value' and 'color')
  const formattedData = rawData.map((item) => ({
    value: item.value || 0,
    color: item.color || '#3b82f6',
    text: `${item.value || 0}`,
    label: item.label,
  }));

  return (
    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-4">
      <Text className="font-bold text-base text-gray-800 mb-4">
        Sales By {title.replace('_', ' ')}
      </Text>
      
      <View className="h-64 bg-gray-50 rounded-xl items-center justify-center border border-gray-100 p-2">
        {loading ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : formattedData.length === 0 ? (
          <Text className="text-gray-400 text-xs">No data available</Text>
        ) : (
          <View className="items-center justify-center">
            <PieChart
              data={formattedData}
              donut
              innerRadius={45}
              radius={80}
              showText
              textColor="black"
              textSize={10}
              showTextBackground={false}
              centerLabelComponent={() => null}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ChartCard;