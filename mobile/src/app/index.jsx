import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function Index() {
  const router = useRouter();
  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        // Verify token validity with your backend
        const { data } = await axios.get('/api/user/is-auth', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
          router.replace('/(tabs)/charts'); // Route to your report/analytics screen
        } else {
          await SecureStore.deleteItemAsync('userToken');
          router.replace('/login');
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}