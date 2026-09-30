import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const ChartContainer = ({ type, timeframe }) => {
  const { startDate, endDate } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/reports/${type.toLowerCase()}`, {
          params: {
            start: startDate,
            end: endDate,
            timeframe: timeframe?.toLowerCase(),
          },
        });

        if (data.success) {
          // Map records into format expected by react-native-gifted-charts: { value, label }
          const formattedData = data.records.map((item) => {
            // Parse date to show short label on X-axis (e.g. "Oct 12")
            const dateObj = new Date(item.date.replace(/-/g, '/'));
            const labelStr = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return {
              value: item.amount,
              label: labelStr,
              dataPointText: `${item.amount}`,
            };
          });

          setChartData(formattedData);
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchChartData();
    }
  }, [type, startDate, endDate, timeframe]);

  if (loading) {
    return (
      <View className="h-[250px] justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <View className="h-[250px] justify-center items-center">
        <Text className="text-gray-400 text-sm">No data available for this range</Text>
      </View>
    );
  }

  return (
    <View className="py-2 items-center">
      <LineChart
        data={chartData}
        width={300}
        height={220}
        color="#3b82f6"
        thickness={3}
        startFillColor="rgba(59, 130, 246, 0.3)"
        endFillColor="rgba(59, 130, 246, 0.01)"
        areaChart
        hideDataPoints={false}
        dataPointsColor="#3b82f6"
        dataPointsRadius={4}
        isAnimated
        animationDuration={1200}
        noOfSections={4}
        yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 9, rotation: -30 }}
        rulesColor="#e5e7eb"
        adjustToWidth={true}
      />
    </View>
  );
};

export default ChartContainer;