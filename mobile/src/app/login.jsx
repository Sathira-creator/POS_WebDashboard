import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setIsSignedIn } = useAppContext();
  
  const [state, setState] = useState('login');
  
  // User Fields
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Shop Fields (for registration)
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopDistrict, setShopDistrict] = useState('');
  const [shopCity, setShopCity] = useState('');

  // Multi-shop branch selection state
  const [pendingShops, setPendingShops] = useState(null);

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Clear session if user abandons branch selection
  const clearSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post('/api/user/logout', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      // Ignore cleanup errors
    }
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('activeShopId');
    setUser(null);
    setIsSignedIn(false);
  };

  const onSubmitHandler = async () => {
    try {
      if (state === 'register') {
        const { data } = await axios.post('/api/shop/register', {
          name,
          position,
          email,
          password,
          shopName,
          address: shopAddress,
          district: shopDistrict,
          city: shopCity
        });

        if (data.success) {
          if (data.token) {
            await SecureStore.setItemAsync('userToken', data.token);
          }
          if (data.user.shops?.length > 0) {
            await SecureStore.setItemAsync('activeShopId', data.user.shops[0]._id);
          }

          setIsSignedIn(true);
          setUser(data.user);

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Shop & Owner registered successfully!',
          });

          router.replace('/(tabs)/charts');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: data.message || 'Registration failed',
          });
        }
      } else {
        const { data } = await axios.post('/api/user/login', { email, password });

        if (data.success) {
          if (data.token) {
            await SecureStore.setItemAsync('userToken', data.token);
          }

          const userShops = data.user.shops || [];

          if (userShops.length === 0) {
            await clearSession();
            Toast.show({
              type: 'error',
              text1: 'Access Denied',
              text2: 'This account is not assigned to any shop.',
            });
            return;
          }

          if (userShops.length === 1) {
            await SecureStore.setItemAsync('activeShopId', userShops[0]._id);
            setUser(data.user);
            setIsSignedIn(true);

            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Successfully logged in!',
            });

            router.replace('/(tabs)/charts');
          } else {
            // Multiple shops available: prompt branch selection
            setUser(data.user);
            setPendingShops(userShops);
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: data.message || 'Login failed',
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message,
      });
    }
  };

  const handleSelectShop = async (shopId) => {
    await SecureStore.setItemAsync('activeShopId', shopId);
    setIsSignedIn(true);
    setPendingShops(null);
    router.replace('/(tabs)/charts');
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Shop selected successfully!',
    });
  };

  return (
    <SafeAreaView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
            <Text className="text-blue-600">{state === 'register' ? 'Register ' : 'User '}</Text>
            {state === 'login' ? 'Login' : 'Shop'}
          </Text>

          {state === 'register' && (
            <>
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-600 mb-1">Your Name</Text>
                <TextInput
                  onChangeText={setName}
                  value={name}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                />
              </View>

              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-600 mb-1">Position / Role</Text>
                <TextInput
                  onChangeText={setPosition}
                  value={position}
                  placeholder="e.g. Owner"
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                />
              </View>

              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-600 mb-1">Shop Name</Text>
                <TextInput
                  onChangeText={setShopName}
                  value={shopName}
                  placeholder="e.g. Downtown Branch"
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                />
              </View>

              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-600 mb-1">Shop Address</Text>
                <TextInput
                  onChangeText={setShopAddress}
                  value={shopAddress}
                  placeholder="e.g. 123 Main Street"
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                />
              </View>

              <View className="flex-row gap-2 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-600 mb-1">City</Text>
                  <TextInput
                    onChangeText={setShopCity}
                    value={shopCity}
                    placeholder="e.g. Colombo"
                    placeholderTextColor="#9ca3af"
                    className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-600 mb-1">District</Text>
                  <TextInput
                    onChangeText={setShopDistrict}
                    value={shopDistrict}
                    placeholder="e.g. Western"
                    placeholderTextColor="#9ca3af"
                    className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
                  />
                </View>
              </View>
            </>
          )}

          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-600 mb-1">Email</Text>
            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="Type here"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
            />
          </View>

          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-600 mb-1">Password</Text>
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Type here"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              className="border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-800"
            />
          </View>

          <View className="mb-6 items-center">
            {state === 'register' ? (
              <Text className="text-xs text-gray-500">
                Already have an account?{' '}
                <Text onPress={() => setState('login')} className="text-blue-600 font-bold">
                  Login here
                </Text>
              </Text>
            ) : (
              <Text className="text-xs text-gray-500">
                Want to register a new shop?{' '}
                <Text onPress={() => setState('register')} className="text-blue-600 font-bold">
                  Click here
                </Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={onSubmitHandler}
            className="bg-blue-600 py-4 rounded-xl items-center shadow-sm"
          >
            <Text className="text-white font-bold text-base">
              {state === 'register' ? 'Create Shop & Account' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MULTI-BRANCH SELECTOR MODAL */}
      <Modal visible={!!pendingShops} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-200">
            <Text className="text-xl font-bold text-center text-gray-800 mb-1">Select Branch</Text>
            <Text className="text-xs text-gray-500 text-center mb-4">
              You have access to multiple shops. Choose one to continue:
            </Text>

            <ScrollView className="max-h-60 mb-4">
              {pendingShops?.map((shop) => (
                <TouchableOpacity
                  key={shop._id}
                  onPress={() => handleSelectShop(shop._id)}
                  className="p-3 border border-gray-200 rounded-xl mb-2 bg-gray-50 active:bg-blue-50"
                >
                  <Text className="font-semibold text-gray-800">{shop.name}</Text>
                  <Text className="text-xs text-gray-400">
                    {[shop.address, shop.city, shop.district].filter(Boolean).join(', ') || 'No location details'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={async () => {
                await clearSession();
                setPendingShops(null);
              }}
              className="py-3 bg-gray-200 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}