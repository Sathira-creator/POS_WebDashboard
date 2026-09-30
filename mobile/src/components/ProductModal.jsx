import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function ProductModal({ visible, mode, product, onClose, onSubmit, onSearchSuccess }) {
  const router = useRouter();
  const { search, setSearch, totalPages, setTotalPages, setFilteredProducts, currentPage, totalItems, setTotalItems } = useAppContext();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [barcode, setBarcode] = useState('');
  const [type, setType] = useState(''); 

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Helper to get active shop headers
  const getHeaders = async () => {
    const activeShopId = await SecureStore.getItemAsync('activeShopId');
    if (!activeShopId) {
      Toast.show({
        type: 'error',
        text1: 'Access Error',
        text2: 'No active shop selected.',
        position: 'top',
      });
      router.replace('/login');
      return null;
    }
    return { 'x-shop-id': activeShopId };
  };

  const handleSearch = async () => {
    try {
      const headers = await getHeaders();
      if (!headers) return;

      const searchParams = { page: currentPage };
      if (name.trim()) searchParams.name = name.trim();
      if (category.trim()) searchParams.category = category.trim();
      if (type.trim()) searchParams.type = type.trim();
      if (barcode.trim()) searchParams.barcode = barcode.trim();
      if (supplier.trim()) searchParams.supplier = supplier.trim();
      if (price.trim()) searchParams.price = price.trim();
      if (quantity.trim()) searchParams.qty = quantity.trim();

      const { data } = await axios.get('/api/inventory/search', {
        headers,
        params: searchParams
      });

      if (data.success) {
        setFilteredProducts(data.results);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        if (onSearchSuccess) onSearchSuccess();
        if (onSubmit) onSubmit();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Search Failed',
          text2: data.message || 'No products found matching your criteria.',
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

  const handleEdit = async () => {
    try {
      const headers = await getHeaders();
      if (!headers) return;

      setSearch(false);
      const { data } = await axios.post('/api/inventory/update', {
        selectedId: product?._id,
        name,
        category,
        type,
        barcode,
        price,
        qty: quantity,
        supplier
      }, { headers });

      if (data.success) {
        Toast.show({ type: 'success', text1: 'Product Updated Successfully', position: 'top' });
        onSubmit();
      } else {
        Toast.show({ type: 'error', text1: 'Update Failed', text2: data.message, position: 'top' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Network Error', text2: error.response?.data?.message || error.message, position: 'top' });
    }
  };

  const handleAdd = async () => {
    try {
      const headers = await getHeaders();
      if (!headers) return;

      setSearch(false);
      const { data } = await axios.post('/api/inventory/add', {
        name,
        category,
        type,
        barcode,
        price,
        qty: quantity,
        supplier
      }, { headers });

      if (data.success) {
        Toast.show({ type: 'success', text1: 'Product Added Successfully', position: 'top' });
        onSubmit();
      } else {
        Toast.show({ type: 'error', text1: 'Failed to Add', text2: data.message, position: 'top' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Network Error', text2: error.response?.data?.message || error.message, position: 'top' });
    }
  };

  const handleSaveOrSearch = () => {
    if (mode === 'search') {
      handleSearch();
    } else if (mode === 'edit') {
      handleEdit();
    } else if (mode === 'add') {
      handleAdd();
    } else {
      onSubmit();
    }
  };

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setQuantity(String(product.qty ?? product.quantity ?? ''));
      setPrice(String(product.price || ''));
      setSupplier(product.supplier || '');
      setBarcode(product.barcode || '');
      setType(product.type || '');
    } else {
      setName('');
      setCategory('');
      setType('');
      setQuantity('');
      setPrice('');
      setSupplier('');
      setBarcode('');
    }
  }, [mode, product, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View className="bg-white w-full rounded-3xl p-6">
          <Text className="text-lg font-bold mb-4">
            {mode === 'edit' ? 'Edit Product' : mode === 'search' ? 'Search Product' : 'Add Product'}
          </Text>

          <TextInput
            placeholder="Product Name"
            value={name}
            onChangeText={setName}
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Type"
            value={type}
            onChangeText={setType}
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Barcode"
            value={barcode}
            onChangeText={setBarcode}
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />
          <TextInput
            placeholder="Supplier"
            value={supplier}
            onChangeText={setSupplier}
            className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
          />

          <View className="flex-row gap-3 mt-3">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-200 p-3 rounded-xl items-center">
              <Text className="font-bold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveOrSearch} className="flex-1 bg-emerald-500 p-3 rounded-xl items-center">
              <Text className="font-bold text-white">{mode === 'search' ? 'Search' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}