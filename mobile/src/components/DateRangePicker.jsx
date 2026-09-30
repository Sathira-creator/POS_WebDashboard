import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';

const DateRangePicker = () => {
  const { startDate, setStartDate, endDate, setEndDate } = useAppContext();
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Helper function to nicely display dates
  const formatDate = (date) => {
    if (!date) return 'Select Date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="flex-col gap-4 pt-2">
      
      {/* Start Date Field */}
      <View>
        <Text className="text-xs font-semibold text-gray-500 mb-1">Start Date</Text>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-row justify-between items-center"
        >
          <Text className="text-gray-800 text-sm font-medium">
            {formatDate(startDate)}
          </Text>
          <Text className="text-xs text-blue-500 font-bold">Change</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
          onDismiss={() => setShowStartPicker(false)}
        />
      )}

      {/* End Date Field */}
      <View>
        <Text className="text-xs font-semibold text-gray-500 mb-1">End Date</Text>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-row justify-between items-center"
        >
          <Text className="text-gray-800 text-sm font-medium">
            {formatDate(endDate)}
          </Text>
          <Text className="text-xs text-blue-500 font-bold">Change</Text>
        </TouchableOpacity>
      </View>

      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display="default"
          onValueChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
          onDismiss={() => setShowEndPicker(false)}
        />
      )}

    </View>
  );
};

export default DateRangePicker;