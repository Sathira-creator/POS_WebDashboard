import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import ProductModal from '../../components/ProductModal';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useAppContext } from '../../context/AppContext';
import ProfileBar from '../../components/ProfileBar';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function InventoryScreen() {
  const router = useRouter();
  const {
    allProducts,
    setAllProducts,
    totalPages,
    setTotalPages,
    filteredProducts,
    setFilteredProducts,
    currentPage,
    setCurrentPage,
    totalItems,
    setTotalItems,
    search,
    setSearch,
  } = useAppContext();
  
  const [selectedId, setSelectedId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ visible: false, mode: 'add' });
  const [editProducts, setEditProducts] = useState(null);

  const [stockSummary, setStockSummary] = useState({ inStock: 0, lowStock: 0, outStock: 0 });
  const [filter, setFilter] = useState("all");

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
      setTimeout(() => {
        router.replace('/login');
      }, 100);
      return null;
    }
    return { 'x-shop-id': activeShopId };
  };

  const fetchAllProducts = async (type) => {
    try {
      const headers = await getHeaders();
      if (!headers) return;

      const { data } = await axios.get('/api/inventory/list', {
        headers,
        params: {
          page: currentPage,
          type: type,
        },
      });

      if (data.success) {
        setAllProducts(data.inventory);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setStockSummary(data.summary);
      } else {
        Toast.show({
          type: 'error',
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

  useEffect(() => {
    if (!search) {
      fetchAllProducts(filter);
    }
  }, [currentPage, filter]);

  const baseData = search
    ? (filteredProducts || [])
    : (allProducts || []);

  const openModal = (mode) => {
    if (mode === 'edit') {
      const itemToEdit = baseData.find((item) => item._id === selectedId);

      if (!itemToEdit) {
        Toast.show({
          type: 'error',
          text1: 'Please select an item to edit.',
          position: 'top',
        });
        return;
      }

      setEditProducts(itemToEdit || null);
    } else {
      setEditProducts(null);
    }
    setModalConfig({ visible: true, mode });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
    setEditProducts(null);
    if (!search) {
      fetchAllProducts(filter); 
    } 
  };

  const handleDelete = async () => {
    setSearch(false);
    if (!selectedId) {
      Toast.show({
        type: 'error',
        text1: 'No Selection',
        text2: 'Please select an item to delete.',
        position: 'top',
      });
      return;
    }

    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await getHeaders();
              if (!headers) return;

              const { data } = await axios.delete('/api/inventory/delete', {
                headers,
                params: {
                  selectedId: selectedId
                }
              });

              if (data.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: data.message || "Item deleted successfully!",
                  position: 'top',
                });
                
                const filtered = allProducts.filter((p) => (p._id || p.id) !== selectedId);
                setAllProducts(filtered);
                setSelectedId(null);
                
                fetchAllProducts(filter);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: data.message || "Could not delete the item.",
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
          }
        }
      ]
    );
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderInventoryItem = ({ item }) => {
    const isSelected = item._id === selectedId;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedId(item._id)}
        className={`flex-row items-center justify-between p-4 my-1.5 rounded-2xl border ${
          isSelected 
            ? 'bg-blue-50/50 border-[#0070F3] shadow-xs' 
            : 'bg-white border-gray-100 shadow-2xs'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-11 h-11 bg-gray-50 rounded-xl items-center justify-center mr-3.5 border border-gray-100">
            <MaterialCommunityIcons name={item.icon || 'package-variant'} size={22} color="#0D1B2A" />
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-sm font-black text-[#0D1B2A]" numberOfLines={1}>{item.name}</Text>
            
            <View className="flex-row items-center mt-1.5 flex-wrap gap-x-3 gap-y-1">
              <Text className="text-xs font-bold text-gray-600">Qty: {item.qty ?? item.quantity}</Text>
              <Text className="text-xs font-extrabold text-[#0070F3]">${Number(item.price || 0).toFixed(2)}</Text>
              {item.barcode ? <Text className="text-xs font-mono text-gray-400">{item.barcode}</Text> : null}
              {item.supplier ? <Text className="text-xs font-medium text-gray-500" numberOfLines={1}>{item.supplier}</Text> : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 px-5"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <View className="flex-row justify-between items-center my-3">
        <View>
          <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overview</Text>
          <Text className="text-2xl font-black text-[#0D1B2A]">Inventory</Text>
        </View>
        <ProfileBar /> 
      </View>

      {/* TOP SECTION: Professional Stat Summary Cards */}
      <View className="mb-3 space-y-2.5">
        
        {/* 1. IN STOCK CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setSearch(false);
            setFilter('inStock');
            setCurrentPage(1);
          }}
          className={`h-20 rounded-3xl px-5 flex-row items-center justify-between bg-white border ${
            filter === 'inStock' ? 'border-emerald-500 shadow-xs bg-emerald-50/10' : 'border-gray-100 shadow-2xs'
          }`}
        >
          <View>
            <Text className="text-[11px] font-black tracking-wider text-emerald-600 uppercase mb-0.5">In Stock</Text>
            <Text className="text-xl font-black text-[#0D1B2A]">
              {stockSummary.inStock} <Text className="text-xs font-semibold text-gray-400">Items</Text>
            </Text>
          </View>
          <View className="w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-100/50">
            <MaterialCommunityIcons name="package-variant-closed-check" size={22} color="#059669" />
          </View>
        </TouchableOpacity>

        {/* 2. LOW STOCK CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setSearch(false);
            setFilter('lowStock');
            setCurrentPage(1);
          }}
          className={`h-20 rounded-3xl px-5 flex-row items-center justify-between bg-white border ${
            filter === 'lowStock' ? 'border-amber-500 shadow-xs bg-amber-50/10' : 'border-gray-100 shadow-2xs'
          }`}
        >
          <View>
            <Text className="text-[11px] font-black tracking-wider text-amber-600 uppercase mb-0.5">Low Stock</Text>
            <Text className="text-xl font-black text-[#0D1B2A]">
              {stockSummary.lowStock} <Text className="text-xs font-semibold text-gray-400">Items</Text>
            </Text>
          </View>
          <View className="w-11 h-11 bg-amber-50 rounded-2xl items-center justify-center border border-amber-100/50">
            <Ionicons name="warning-outline" size={22} color="#D97706" />
          </View>
        </TouchableOpacity>

        {/* 3. OUT OF STOCK CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setSearch(false);
            setFilter('outStock');
            setCurrentPage(1);
          }}
          className={`h-20 rounded-3xl px-5 flex-row items-center justify-between bg-white border ${
            filter === 'outStock' ? 'border-rose-500 shadow-xs bg-rose-50/10' : 'border-gray-100 shadow-2xs'
          }`}
        >
          <View>
            <Text className="text-[11px] font-black tracking-wider text-rose-600 uppercase mb-0.5">Out of Stock</Text>
            <Text className="text-xl font-black text-[#0D1B2A]">
              {stockSummary.outStock} <Text className="text-xs font-semibold text-gray-400">Items</Text>
            </Text>
          </View>
          <View className="w-11 h-11 bg-rose-50 rounded-2xl items-center justify-center border border-rose-100/50">
            <MaterialCommunityIcons name="circle-off-outline" size={22} color="#E11D48" />
          </View>
        </TouchableOpacity>

        {/* Section Heading & Label Toolbar */}
        <View className="flex-row justify-between items-center mt-3 px-1">
          <Text className="text-xs font-black text-[#0D1B2A] uppercase tracking-wider">Item Details</Text>
          
          {/* Quick Edit/Remove Management Bar */}
          <View className="flex-row gap-2">
            <TouchableOpacity 
              className="py-1 px-3 rounded-xl bg-emerald-50 border border-emerald-200"
              onPress={() => openModal('edit')}
            >
              <Text className="text-[11px] font-black text-emerald-600 uppercase">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="py-1 px-3 rounded-xl bg-rose-50 border border-rose-200"
              onPress={handleDelete}
            >
              <Text className="text-[11px] font-black text-rose-600 uppercase">Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MIDDLE SECTION: Scrollable List Container */}
      <View className="flex-1 my-1">
        <FlatList
          data={baseData}
          keyExtractor={(item) => item._id}
          extraData={selectedId}
          renderItem={renderInventoryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 my-2">
              <MaterialCommunityIcons name="package-variant" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-wider">No items found</Text>
            </View>
          }
        />
      </View>

      {/* BOTTOM SECTION: Pagination & Primary Actions */}
      <View className="pb-4 pt-2">
        {/* Pagination Bar */}
        <View className="flex-row items-center justify-between mb-3 px-4 bg-white py-3 rounded-2xl border border-gray-100 shadow-2xs">
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
            className="p-2 rounded-xl bg-gray-50 border border-gray-100"
          >
            <Ionicons name="chevron-back" size={14} color="#0D1B2A" />
          </TouchableOpacity>

          <Text className="font-black text-xs text-[#0D1B2A] tracking-wider uppercase">
            Page {currentPage} of {totalPages || 1}
          </Text>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage >= (totalPages || 1)}
            style={{ opacity: currentPage >= (totalPages || 1) ? 0.3 : 1 }}
            className="p-2 rounded-xl bg-gray-50 border border-gray-100"
          >
            <Ionicons name="chevron-forward" size={14} color="#0D1B2A" />
          </TouchableOpacity>
        </View>

        {/* Primary Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openModal('add')}
            className="flex-1 bg-[#059669] rounded-2xl h-13 justify-center items-center shadow-sm shadow-emerald-500/20"
          >
            <Text className="text-white text-xs font-black tracking-wider uppercase">
              Add Product +
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setCurrentPage(1);
              openModal('search');
            }}
            className="flex-1 bg-[#0D1B2A] rounded-2xl h-13 flex-row justify-center items-center px-2 shadow-sm shadow-slate-900/20"
          >
            <Text className="text-white text-xs font-black tracking-wider mr-2 uppercase">
              Search
            </Text>
            <MaterialCommunityIcons name="magnify" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal component */}
      <ProductModal
        visible={modalConfig.visible}
        mode={modalConfig.mode}
        product={editProducts}
        onClose={closeModal}
        onSubmit={closeModal}
        onSearchSuccess={() => setSearch(true)}
      />
    </SafeAreaView>
  );
}