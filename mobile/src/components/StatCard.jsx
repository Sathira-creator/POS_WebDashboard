import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * StatCard Component
 * @param {string} label - The title of the metric (e.g., "Total Sales")
 * @param {string} value - The numeric data to display (e.g., "Rs. 1,340,000.00")
 * @param {string} color - Tailwind class for the background (e.g., "bg-green-100")
 * @param {string} textColor - Tailwind class for the label text (e.g., "text-green-600")
 * @param {React.ReactNode} icon - The icon or symbol to display in the white box
 * @param {function} onClick - Function to run when pressed
 */

const StatCard = ({ label, value, color, textColor, icon, onClick }) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      className={`${color} p-5 rounded-2xl flex-row items-center shadow-sm border border-white/50`}
    >
      {/* Icon Container */}
      <View className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mr-4">
        <Text className={`text-2xl font-bold ${textColor}`}>
          {icon}
        </Text>
      </View>

      {/* Text Content */}
      <View className="flex-col">
        <Text className={`text-xs font-bold uppercase tracking-wide ${textColor} opacity-80`}>
          {label}
        </Text>
        <Text className="text-xl font-black text-gray-800">
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default StatCard;