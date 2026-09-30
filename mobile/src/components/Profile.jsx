import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Profile = () => {
  const { showProfile, setShowProfile, isSignedIn, setIsSignedIn, user, setUser, setShowUserLogin } = useAppContext();
  const router = useRouter();
  
  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const handleActionClick = async () => {
    if (isSignedIn) {
      try {
        // 1. Clear token from device storage
        await SecureStore.deleteItemAsync('userToken');

        // 2. Call backend logout
        await axios.get('/api/user/logout');
        
        // 3. Update global states
        setIsSignedIn(false);
        setUser(null);
        setShowProfile(false);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully logged out',
        });

        // 4. Redirect to login screen
        router.replace('/login');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || error.message,
        });
      }
    } else {
      // Handle Log In action
      setShowProfile(false);
      router.replace('/login');
    }
  };

  return (
    <Modal
      visible={showProfile}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowProfile(false)}
    >
      {/* Backdrop overlay */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={() => setShowProfile(false)}
        className="flex-1 justify-start items-end bg-black/40 p-6 pt-16"
      >
        {/* Main Card Container (stops backdrop click propagation) */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()} 
          className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
        >
          {/* Header Section: Avatar and Info */}
          <View className="flex-row items-center gap-4 mb-6">
            {/* Dynamic Initial Avatar */}
            <View className="w-14 h-14 bg-gradient-to-br from-[#0070F3] to-[#208AEF] rounded-2xl items-center justify-center shadow-md shadow-blue-500/20">
              <Text className="text-white font-black text-xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            
            {/* User Details */}
            <View className="flex-col flex-1">
              {isSignedIn ? (
                <>
                  <Text className="text-base font-black text-[#0D1B2A] leading-tight" numberOfLines={1}>
                    {user?.name || 'User Name'}
                  </Text>
                  <Text className="text-[11px] font-bold text-[#0070F3] uppercase tracking-wide mt-1" numberOfLines={1}>
                    {user?.position || user?.role || 'Staff Member'}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-base font-black text-[#0D1B2A] leading-tight" numberOfLines={1}>
                    Guest User
                  </Text>
                  <Text className="text-[11px] font-medium text-gray-400 mt-0.5" numberOfLines={1}>
                    Please sign in to continue
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            className={`w-full py-3.5 rounded-2xl items-center shadow-sm active:scale-98 ${
              isSignedIn 
                ? 'bg-rose-50 border border-rose-200/60' 
                : 'bg-[#0070F3] shadow-blue-500/25'
            }`}
            onPress={handleActionClick}
          >
            <Text className={`font-black text-xs tracking-wider uppercase ${
              isSignedIn ? 'text-rose-600' : 'text-white'
            }`}>
              {isSignedIn ? 'Log Out' : 'Log In'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default Profile;