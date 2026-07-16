
import axios from 'axios';
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Keypad = () => {

    const { cartItems, setCartItems } = useAppContext();
    const [display, setDisplay] = useState("");

    const handleNumber = (num) => {
        // Optional: Limit to 10 digits
        if (display.length < 10) {
            setDisplay((prev) => prev + num);
        }
    };

    const handleDelete = () => {
        setDisplay((prev) => prev.slice(0, -1));
    };

    const handleAdd = async() => {
      try{
        const {data} = await axios.get('/api/pos/list', {
                params: {
                barCord: display,
            }
            });

            if (data.success) {
                const fetchedItem = data.product;

                setCartItems((prevItems) => {
                    // Check if item already exists in the cart list
                    const existingItem = prevItems.find(item => item.id === fetchedItem.id);

                    if (existingItem) {
                        // Increment item count if within inventory stock limits
                        return prevItems.map(item =>
                            item.id === fetchedItem.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                    } else {
                        return [...prevItems, { ...fetchedItem, quantity: 1, discount: 0 }];
                    }
                });

                setDisplay(""); // Clear keypad display on success
                toast.success(`${fetchedItem.item} added to cart.`);
            } else {
                toast.error(data.message);
            }

      }catch(error){
        toast.error(error.response?.data?.message || "Failed to fetch item.");
      }

    };
  return (
    <div className="flex flex-col gap-6 w-[350px] bg-[#AEE8F5] p-6 rounded-3xl shadow-lg font-sans">
      
      {/* 1. Display Screen */}
      <div className="flex items-center justify-end h-20 bg-white rounded-xl px-4 text-4xl font-bold text-gray-800 overflow-hidden border-4 border-transparent">
        {display}
        <span className="animate-pulse font-light text-gray-400">|</span>
      </div>

      {/* 2. Number Grid */}
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num.toString())}
            className="w-20 h-20 bg-[#3F64BE] hover:bg-[#3453a1] active:scale-95 text-black text-5xl font-bold rounded-xl transition-all"
          >
            {num}
          </button>
        ))}
        
        {/* Spacer for 0 alignment */}
        <div /> 
        <button
          onClick={() => handleNumber("0")}
          className="w-20 h-20 bg-[#3F64BE] hover:bg-[#3453a1] active:scale-95 text-black text-5xl font-bold rounded-xl transition-all"
        >
          0
        </button>
        <div />
      </div>

      {/* 3. Control Buttons */}
      <div className="flex justify-between gap-4 mt-2">
        <button
          onClick={handleAdd}
          className="flex-1 bg-[#92FA7E] hover:bg-[#7ee36b] active:scale-95 py-4 rounded-xl text-white text-2xl font-black tracking-wider transition-all"
        >
          ADD
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-[#FA7F7E] hover:bg-[#e66a6a] active:scale-95 py-4 rounded-xl text-white text-2xl font-black tracking-wider transition-all"
        >
          DELETE
        </button>
      </div>
    </div>
  )
}

export default Keypad