import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import CheckoutBox from './CheckoutBox';
import toast from 'react-hot-toast';
import axios from 'axios';

const Cart = () => {

    const{ cartItems, setCartItems, showCheckoutBox, setShowCheckoutBox } = useAppContext();
    const [selectedId, setSelectedId] = useState(null);

    const formattedItems = cartItems.map((product) => ({
      productId: product.id, // Handles standard MongoDB object mappings smoothly
      itemName: product.item , // Maps front-end 'item' to backend 'itemName'
      quantity: product.quantity,
      unitPrice: product.price,
      discountPercentage: product.discount ? Number(product.discount) : 0
    }));

    // Function to remove the selected item
    const handleRemove = () => {
        if (selectedId) {
        setCartItems(cartItems.filter(item => item.id !== selectedId));
        setSelectedId(null); // Reset selection
        } else {
          toast.error("Please select an item to remove.");
        }
    };

    const calculateTotal = () => {
      return cartItems.reduce((acc, item) => {
        const itemSubtotal = item.quantity * item.price;
        const discountRate = item.discount ? (Number(item.discount) / 100) : 0;
        return acc + (itemSubtotal - (itemSubtotal * discountRate));
      }, 0);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
          toast.error("Your cart is empty!");
          return;
        }
        setShowCheckoutBox(true);
        
    };

    const handleConfirmOrder = async(summaryData) => {
      try{

        const { data } = await axios.post('/api/order/create', {
          items: formattedItems,  
          subtotal: summaryData.subtotal, 
          totalDiscount: summaryData.totalDiscount, 
          netTotal: summaryData.netTotal, 
          paymentMethod: summaryData.paymentMethod, 
          cashReceived: summaryData.cashReceived, 
          changeGiven: summaryData.changeDue 
        });

        if (data.success) {
          toast.success(data.message);
          console.log("Payment Confirmed Data:", data.order);
          setCartItems([]); // Clear cart items layout

        }else{
          toast.error(data.message);

        }

      }catch(error){
        toast.error(error.message)
      }
      
    };

    const currentTotal = calculateTotal();

  return (
    <div className="flex flex-col w-full max-w-2xl p-4 font-sans">
      
      {/* Table Container with Cyan Border */}
      <div className="border-[12px] border-[#AEE8F5] rounded-xl overflow-hidden min-h-[400px] bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 font-bold">Item</th>
              <th className="p-3 font-bold text-center">Quantity</th>
              <th className="p-3 font-bold text-center">U/price</th>
              <th className="p-3 font-bold text-center">Dis%</th>
              <th className="p-3 font-bold text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((product) => (
              <tr 
                key={product.id}
                onClick={() => setSelectedId(product.id)}
                className={`cursor-pointer border-b transition-colors ${
                  selectedId === product.id ? 'bg-cyan-100' : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-3 font-bold text-black">{product.item}</td>
                <td className="p-3 text-center font-bold">{product.quantity}</td>
                <td className="p-3 text-center font-bold">${product.price.toFixed(2)}</td>
                <td className="p-3 text-center font-bold">{product.discount}</td>
                <td className="p-3 text-center font-bold">
                  ${(product.quantity * product.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Placeholder if cart is empty */}
        {cartItems.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-bold italic">
            Cart is empty
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button 
          onClick={handleCheckout}
          className="flex-1 bg-[#92FA7E] hover:bg-[#7ee36b] active:scale-95 text-white text-4xl font-bold py-6 rounded-2xl shadow-md transition-all uppercase"
        >
          Checkout
        </button>
        <button 
          onClick={handleRemove}
          className="flex-1 bg-[#FA7F7E] hover:bg-[#e66a6a] active:scale-95 text-white text-4xl font-bold py-6 rounded-2xl shadow-md transition-all uppercase"
        >
          Remove
        </button>
      </div>

      {showCheckoutBox && (
        <CheckoutBox 
          subtotal={currentTotal} 
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  )
}

export default Cart