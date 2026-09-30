import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

// Import your mobile-compatible components
import ChartContainer from '../../components/ChartContainer';
import DateRangePicker from '../../components/DateRangePicker';
import ChartCard from '../../components/ChartCard';
import StatCard from '../../components/StatCard';
import BarChartCard from '../../components/BarChartCard';
import ProfileBar from '../../components/ProfileBar';

export default function ReportScreen() {
  const router = useRouter();
  const { startDate, endDate } = useAppContext();
  const [activeType, setActiveType] = useState('sales');
  const [timeframe, setTimeframe] = useState('Daily');
  const [sales, setSales] = useState(0);
  const [orders, setOrders] = useState(0);
  const [aov, setAov] = useState(0);

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Helper to retrieve secure headers for backend verification
  const getHeaders = async () => {
    const activeShopId = await SecureStore.getItemAsync('activeShopId');
    const token = await SecureStore.getItemAsync('token');

    if (!activeShopId) {
      Toast.show({
        type: 'error',
        text1: 'Access Error',
        text2: 'No active shop selected.',
        position: 'top',
      });
      setTimeout(() => {
        router.replace('/login');
      }, 100);
      return null;
    }

    return {
      'x-shop-id': activeShopId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const fetchStatcardData = async () => {
      if (!startDate || !endDate) return;

      try {
        const headers = await getHeaders();
        if (!headers) return;

        const { data } = await axios.get(`/api/reports/statdata`, {
          headers,
          params: {
            start: startDate,
            end: endDate,
          },
        });

        if (data.success) {
          setSales(data.sales);
          setOrders(data.orders);
          setAov(data.aov);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: data.message,
            position: 'top',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: error.response?.data?.message || error.message,
          position: 'top',
        });
      }
    };

    fetchStatcardData();
  }, [startDate, endDate]);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overview</Text>
            <Text className="text-2xl font-black text-[#0D1B2A]">Reports</Text>
          </View>
          <ProfileBar /> 
        </View>
        
        {/* Top Stats Section */}
        <View className="flex-col gap-3 mb-6">
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
        </View>

        {/* Date Range Picker Sidebar/Section */}
        <View className="bg-white shadow-xs border border-gray-100 rounded-3xl p-5 mb-6">
          <Text className="font-black text-xs mb-3 text-[#0D1B2A] uppercase tracking-wider">Select Date Range</Text>
          <DateRangePicker />
        </View>

        {/* Sales Trend Chart Section */}
        <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-black text-base text-[#0D1B2A] capitalize">{activeType} Trend</Text>
            
            {/* Mobile Timeframe Segment Toggle */}
            <View className="flex-row bg-gray-50 border border-gray-100 p-1 rounded-xl">
              {['Daily', 'Weekly', 'Monthly'].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTimeframe(item)}
                  className={`px-3 py-1.5 rounded-lg ${timeframe === item ? 'bg-white shadow-xs' : ''}`}
                >
                  <Text className={`text-xs font-black ${timeframe === item ? 'text-[#0070F3]' : 'text-gray-400'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ChartContainer type={activeType} timeframe={timeframe} />
        </View>

        {/* Bottom Grid Pie Charts */}
        <View className="mb-6">
          <Text className="font-black text-base text-[#0D1B2A] mb-3">Performance Breakdowns</Text>
          <View className="flex-col gap-4">
            <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100">
              <ChartCard title="Payment_Method" />
            </View>
            <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100">
              <ChartCard title="Category" />
            </View>
            <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100">
              <ChartCard title="Time_Period" />
            </View>
          </View>
        </View>

        {/* Bar Charts Section */}
        <View className="mb-2">
          <Text className="font-black text-base text-[#0D1B2A] mb-3">Top Rankings</Text>
          <View className="flex-col gap-4">
            <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100">
              <BarChartCard type="topSelling" />
            </View>
            <View className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100">
              <BarChartCard type="topEmployees" />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}