import axios from 'axios';
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Keypad = () => {
    const { navigate } = useAppContext();
    const [display, setDisplay] = useState("");

    // Helper to get active shop headers
    const getHeaders = () => {
      const activeShopId = 
        localStorage.getItem('activeShopId') || 
        localStorage.getItem('shopId') || 
        localStorage.getItem('currentShop');

      if (!activeShopId) {
        toast.error('No active shop selected.');
        navigate('/');
        return null;
      }
      return { 'x-shop-id': activeShopId };
    };

    const handleNumber = (num) => {
        if (display.length < 10) {
            setDisplay((prev) => prev + num);
        }
    };

    const handleDelete = () => {
        setDisplay((prev) => prev.slice(0, -1));
    };

    const handleAdd = async () => {
      if (!display) return;

      try {
        const headers = getHeaders();
        if (!headers) return;

        const { data } = await axios.get('/api/pos/list', {
            headers,
            params: {
                barCord: display,
            },
            withCredentials: true
        });

        if (data.success) {
            const fetchedItem = data.product;
            setDisplay(""); 
            toast.success(`${fetchedItem.item || 'Item'} added to cart.`);
        } else {
            toast.error(data.message || "Product not found.");
        }

      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch item.");
      }
    };

  return (
    <div className="flex flex-col gap-6 w-[360px] bg-gradient-to-br from-[#0D1B2A] to-[#1B365D] p-6 rounded-3xl shadow-2xl font-sans border border-white/10">
      
      {/* 1. Display Screen */}
      <div className="flex items-center justify-between h-20 bg-white/10 backdrop-blur-md rounded-2xl px-5 text-3xl font-mono tracking-wider text-white overflow-hidden border border-white/20 shadow-inner">
        <span className="truncate">{display || <span className="text-white/30 text-lg font-sans">Enter Barcode...</span>}</span>
        <span className="animate-pulse font-light text-[#0070F3]">|</span>
      </div>

      {/* 2. Number Grid */}
      <div className="grid grid-cols-3 gap-3.5 justify-items-center">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num.toString())}
            className="w-20 h-20 bg-white/5 hover:bg-white/10 active:scale-95 text-white text-3xl font-bold rounded-2xl transition-all shadow-sm border border-white/10 flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        
        {/* Spacer for 0 alignment */}
        <div /> 
        <button
          onClick={() => handleNumber("0")}
          className="w-20 h-20 bg-white/5 hover:bg-white/10 active:scale-95 text-white text-3xl font-bold rounded-2xl transition-all shadow-sm border border-white/10 flex items-center justify-center"
        >
          0
        </button>
        <div />
      </div>

      {/* 3. Control Buttons */}
      <div className="flex justify-between gap-3 mt-1">
        <button
          onClick={handleAdd}
          className="flex-1 bg-gradient-to-r from-[#0070F3] to-[#208AEF] hover:from-[#005bb5] hover:to-[#1a73cc] active:scale-95 py-4 rounded-2xl text-white text-xl font-black tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          ADD
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-white/10 hover:bg-red-500/20 hover:border-red-400/50 border border-white/10 active:scale-95 py-4 rounded-2xl text-red-400 text-xl font-black tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          DEL
        </button>
      </div>
    </div>
  )
}

export default Keypad;