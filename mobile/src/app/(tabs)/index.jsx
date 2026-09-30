import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, Modal, TextInput } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const SCAN_BOX_SIZE = width * 0.7;

axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

const Index = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  if (!permission) return <View style={{ flex: 1, backgroundColor: "black" }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper to get active shop headers
  const getHeaders = async () => {
    const activeShopId = await SecureStore.getItemAsync('activeShopId');
    const token = await SecureStore.getItemAsync('token'); // Assuming you stored your JWT here on login

    if (!activeShopId) {
      Toast.show({ type: 'error', text1: 'No active shop selected.' });
      router.replace('/login');
      return null;
    }

    return { 
      'x-shop-id': activeShopId,
      'Authorization': `Bearer ${token}` // <--- Required for authUser middleware
    };
  };

  const handleBarCodeScanned = async ({ type, data: barcodeText }) => {
    try {
      setScanned(true);

      const headers = await getHeaders();
      if (!headers) {
        setScanned(false);
        return;
      }
      
      // 1. ONLY LOOK UP THE PRODUCT (Does not touch the cart yet)
      const response = await axios.get('/api/pos/lookup', {
        headers,
        params: { barCord: barcodeText },
        withCredentials: true
      });

      if (response.data.success && response.data.product) {
        const item = response.data.product; 
        setScannedData({
          barcode: barcodeText,
          type,
          id: item.id,
          name: item.item,
          price: `$${Number(item.price || 0).toFixed(2)}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Product Not Found',
          text2: `No item found for barcode: ${barcodeText}`,
          position: 'top',
        });
        setScanned(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Search Error',
        text2: error.response?.data?.message || error.message, 
        position: 'top',
      });
      setScanned(false);
    }
  };

  // Called when user hits "Add Item" button after scanning/looking up
  const handleAddToCart = async () => {
    if (!scannedData) return;

    try {
      const headers = await getHeaders();
      if (!headers) return;

      // Hitting the scan/list endpoint a second time or executing the add action 
      // ensures the backend's Cart model receives the increment and pushes the socket broadcast.
      const response = await axios.get('/api/pos/list', {
        headers,
        params: { barCord: scannedData.barcode },
        withCredentials: true
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Added to Cart',
          text2: `${scannedData.name} added successfully!`,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Could not add item.',
          position: 'top',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cart Error',
        text2: error.response?.data?.message || error.message,
        position: 'top',
      });
    } finally {
      setScanned(false);
      setScannedData(null);
    }
  };

  const handleManualSubmit = () => {
    if (!manualBarcode.trim()) return;
    setManualModalVisible(false);
    handleBarCodeScanned({ type: "MANUAL", data: manualBarcode.trim() });
    setManualBarcode("");
  };

  return (
    <View className="flex-1 bg-black relative">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a", "upc_e"],
        }}
      />

      {/* Scanning Frame Overlay */}
      <View className="absolute inset-0 z-10" pointerEvents="box-none">
        <View className="flex-1 bg-black/60" />
        <View className="flex-row" style={{ height: SCAN_BOX_SIZE }}>
          <View className="flex-1 bg-black/60" />
          <View className="relative" style={{ width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE }}>
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-400" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-400" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-400" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-400" />
          </View>
          <View className="flex-1 bg-black/60" />
        </View>
        <View className="flex-1 bg-black/60" />
      </View>

      {/* Header Controls */}
      <View className="absolute top-12 left-5 right-5 z-20 flex-row justify-between items-center">
        <Text className="text-white text-xl font-bold">Scan Barcode</Text>
        <TouchableOpacity
          className={`w-11 h-11 rounded-full justify-center items-center ${
            torch ? "bg-white" : "bg-black/50"
          }`}
          onPress={() => setTorch(!torch)}
        >
          <MaterialCommunityIcons
            name={torch ? "flash" : "flash-off"}
            size={24}
            color={torch ? "#000" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Action Dock */}
      <View className="absolute bottom-10 left-5 right-5 z-20">
        {scanned && scannedData ? (
          <View className="bg-white rounded-2xl p-5 shadow-lg elevation-8">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-slate-900 text-lg font-bold">{scannedData.name}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Code: {scannedData.barcode}</Text>
              </View>
              <Text className="text-green-600 text-2xl font-extrabold">{scannedData.price}</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-100 py-3 rounded-lg justify-center items-center"
                onPress={() => {
                  setScanned(false);
                  setScannedData(null);
                }}
              >
                <Text className="text-slate-600 font-semibold">Rescan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg flex-row justify-center items-center gap-1.5"
                onPress={handleAddToCart}
              >
                <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
                <Text className="text-white font-semibold">Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-slate-800/95 py-3.5 rounded-xl flex-row justify-center items-center gap-2"
            onPress={() => setManualModalVisible(true)}
          >
            <MaterialCommunityIcons name="keyboard-outline" size={22} color="#fff" />
            <Text className="text-white text-base font-semibold">Enter Barcode Manually</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual Entry Modal */}
      <Modal visible={manualModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center p-5">
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-slate-900 text-lg font-bold mb-4">Manual Barcode Entry</Text>
            <TextInput
              className="border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-5"
              placeholder="Enter barcode number..."
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-100 py-3 rounded-lg items-center"
                onPress={() => setManualModalVisible(false)}
              >
                <Text className="text-slate-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                onPress={handleManualSubmit}
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Index;