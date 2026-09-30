import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'expo-router';

const ProfileBar = () => {
  const { isSignedIn, user, setShowProfile } = useAppContext();
  const router = useRouter();

  const handlePress = () => {
    if (isSignedIn) {
      setShowProfile(true); // Opens your profile modal drawer
    } else {
      router.push('/login'); // Safe navigation push instead of replace inside header bars
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="flex-row items-center gap-2.5 bg-white px-3.5 py-2 rounded-full border border-gray-100 shadow-xs"
    >
      {/* Name and Position (Stacked on the left of the icon) */}
      <View className="items-end max-w-[130px]">
        <Text className="text-xs font-black text-[#0D1B2A]" numberOfLines={1}>
          {isSignedIn && user?.name ? user.name : 'Guest User'}
        </Text>
        <Text className="text-[10px] font-bold text-[#0070F3] uppercase tracking-wide mt-0.5" numberOfLines={1}>
          {isSignedIn && (user?.position || user?.role) ? (user.position || user.role) : 'Tap to login'}
        </Text>
      </View>

      {/* Small Profile Icon / Initial Avatar */}
      <View className="w-9 h-9 bg-[#0070F3] rounded-full items-center justify-center shadow-sm shadow-blue-500/20">
        <Text className="text-white font-black text-xs">
          {isSignedIn && user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileBar;