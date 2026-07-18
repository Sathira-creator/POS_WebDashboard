import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import CheckoutBox from './CheckoutBox';
import toast from 'react-hot-toast';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import ReceiptView from './ReceiptView';

const Cart = () => {

    const{ cartItems, setCartItems, showCheckoutBox, setShowCheckoutBox } = useAppContext();
    const [selectedId, setSelectedId] = useState(null);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);


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
          setCompletedOrder(data.order); 
          setShowReceiptModal(true);

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

      {/* to show the receipt modal after order completion */}

      {showReceiptModal && completedOrder && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row gap-8 items-center max-h-[90vh] overflow-y-auto">
          
          {/* Left: Reusable Thermal Receipt Rendering Canvas */}
          <div className="flex-1 w-full border border-gray-200 p-2 rounded-xl bg-gray-50 max-h-[70vh] overflow-y-auto">
            <ReceiptView order={completedOrder} />
          </div>

          {/* Right: Interactive Customer QR Actions Panel */}
          <div className="flex flex-col items-center text-center p-4 min-w-[260px]">
            <h3 className="text-xl font-black text-gray-800 mb-2">Scan for Soft Copy</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-[200px]">
              Point customer phone camera here to download digital copy instantly.
            </p>
            
            {/* Dynamic Live QR Generation String Wrapper */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-[#AEE8F5]">
              <QRCodeSVG 
                value={`${window.location.origin}/public/receipt/${completedOrder._id}`}
                size={180}
                level={"H"}
              />
            </div>

            <button
              onClick={() => {
                setShowReceiptModal(false);
                setCompletedOrder(null);
              }}
              className="mt-8 w-full bg-[#3F64BE] hover:bg-[#3453a1] text-white font-bold py-4 rounded-xl shadow transition-all uppercase tracking-wide active:scale-95"
            >
              Done / New Order
            </button>
          </div>

        </div>
      </div>
    )}
    </div>
  )
}

export default Cart