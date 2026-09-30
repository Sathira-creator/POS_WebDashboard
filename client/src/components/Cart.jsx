import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import CheckoutBox from './CheckoutBox';
import toast from 'react-hot-toast';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import ReceiptView from './ReceiptView';
import { io } from 'socket.io-client';

const Cart = () => {
    const { user, navigate } = useAppContext();
    const [cartItems, setCartItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showCheckoutBox, setShowCheckoutBox] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

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

    // 1. Fetch Cart Data & Setup Socket.io Real-Time Synchronization
    useEffect(() => {
      const activeShopId = localStorage.getItem('activeShopId') || localStorage.getItem('shopId') || localStorage.getItem('currentShop');
      const employeeId = user?._id || user?.id;

      if (!activeShopId || !employeeId) return; 

      const fetchCart = async () => {
        try {
          const { data } = await axios.get('/api/pos/current', {
            headers: getHeaders(),
            withCredentials: true
          });
          if (data.success && data.cart && data.cart.items) {
            const mapped = data.cart.items.map(item => ({
              id: item.productId?._id || item.productId,
              item: item.itemName || item.productId?.name,
              price: item.unitPrice,
              quantity: item.quantity,
              discount: item.discountPercentage || 0
            }));
            setCartItems(mapped);
          }
        } catch (error) {
          setCartItems([]);
        }
      };

      fetchCart();

      const socket = io('http://localhost:4000', { withCredentials: true });

      socket.emit('join_employee_cart', { shopId: activeShopId, employeeId });

      socket.on('cart_updated', (updatedCart) => {
        if (updatedCart && updatedCart.items) {
          const mapped = updatedCart.items.map(item => ({
            id: item.productId?._id || item.productId,
            item: item.itemName || item.productId?.name,
            price: item.unitPrice,
            quantity: item.quantity,
            discount: item.discountPercentage || 0
          }));
          setCartItems(mapped);
        } else {
          setCartItems([]); 
        }
      });

      return () => {
        socket.disconnect();
      };
    }, [user]);

    const formattedItems = cartItems.map((product) => ({
      productId: product.id, 
      itemName: product.item, 
      quantity: product.quantity,
      unitPrice: product.price,
      discountPercentage: product.discount ? Number(product.discount) : 0
    }));

    const handleRemove = async () => {
        if (!selectedId) {
            toast.error("Please select an item to remove.");
            return;
        }

        try {
            const headers = getHeaders();
            if (!headers) return;

            const { data } = await axios.delete('/api/pos/remove', {
                headers,
                data: { productId: selectedId },
                withCredentials: true
            });

            if (data.success) {
                setSelectedId(null);
                toast.success("Item removed from cart.");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove item.");
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

    const handleConfirmOrder = async (summaryData) => {
      try {
        const headers = getHeaders();
        if (!headers) return;

        const { data } = await axios.post('/api/order/create', {
          items: formattedItems,  
          subtotal: summaryData.subtotal, 
          totalDiscount: summaryData.totalDiscount, 
          netTotal: summaryData.netTotal, 
          paymentMethod: summaryData.paymentMethod, 
          cashReceived: summaryData.cashReceived, 
          changeGiven: summaryData.changeDue 
        }, {
          headers,
          withCredentials: true
        });

        if (data.success) {
          toast.success(data.message);
          setCartItems([]); 
          setCompletedOrder(data.order); 
          setShowReceiptModal(true);
          setShowCheckoutBox(false);
        } else {
          toast.error(data.message);
        }

      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    };

    const currentTotal = calculateTotal();

  return (
    <div className="flex flex-col w-full max-w-3xl p-6 font-sans">
      {/* Header Title Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-[#0D1B2A] tracking-tight flex items-center gap-2">
          <span className="w-3 h-8 bg-gradient-to-b from-[#0D1B2A] to-[#0070F3] rounded-full inline-block"></span>
          Current POS Cart
        </h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
          {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[380px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#0D1B2A] to-[#1B365D] text-white text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Item Details</th>
                <th className="p-4 font-semibold text-center">Qty</th>
                <th className="p-4 font-semibold text-center">U/Price</th>
                <th className="p-4 font-semibold text-center">Disc%</th>
                <th className="p-4 font-semibold text-right pr-6">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cartItems.map((product) => {
                const itemSubtotal = product.quantity * product.price;
                const discRate = product.discount ? Number(product.discount) / 100 : 0;
                const finalItemTotal = itemSubtotal - (itemSubtotal * discRate);

                return (
                  <tr 
                    key={product.id}
                    onClick={() => setSelectedId(product.id)}
                    className={`cursor-pointer transition-all duration-150 ${
                      selectedId === product.id 
                        ? 'bg-[#E6F4FE] border-l-4 border-[#0070F3]' 
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="p-4 font-bold text-[#0D1B2A]">{product.item}</td>
                    <td className="p-4 text-center font-medium text-gray-700">{product.quantity}</td>
                    <td className="p-4 text-center font-medium text-gray-700">${Number(product.price).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-50 text-[#0070F3] font-semibold px-2 py-0.5 rounded-md text-xs">
                        {product.discount}%
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 font-bold text-[#0D1B2A]">
                      ${finalItemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="font-semibold text-base text-gray-400">Your cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">Select products to add items to this order</p>
          </div>
        )}

        {/* Live Total Bar Footer Inside Card */}
        {cartItems.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500 font-medium text-sm">Estimated Total Amount</span>
            <span className="text-2xl font-black text-[#0D1B2A]">${currentTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button 
          onClick={handleCheckout}
          className="flex-1 bg-gradient-to-r from-[#0070F3] to-[#208AEF] hover:from-[#005bb5] hover:to-[#1a73cc] active:scale-[0.98] text-white text-xl font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Checkout
        </button>
        
        <button 
          onClick={handleRemove}
          className="flex-1 bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 active:scale-[0.98] text-xl font-bold py-4 rounded-2xl shadow-sm transition-all uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          Remove Item
        </button>
      </div>

      {/* Checkout Modal / Box */}
      {showCheckoutBox && (
        <CheckoutBox 
          subtotal={parseFloat(currentTotal.toFixed(2))} 
          onConfirm={handleConfirmOrder}
        />
      )}

      {/* Receipt Success Modal */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row gap-8 items-center max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex-1 w-full border border-gray-100 p-2 rounded-2xl bg-gray-50/50 max-h-[70vh] overflow-y-auto shadow-inner">
              <ReceiptView order={completedOrder} />
            </div>

            <div className="flex flex-col items-center text-center p-4 min-w-[260px]">
              <div className="w-12 h-12 bg-blue-50 text-[#0070F3] rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-[#0D1B2A] mb-1">Scan for Soft Copy</h3>
              <p className="text-xs text-gray-500 mb-5 max-w-[210px]">
                Point customer phone camera here to download digital receipt instantly.
              </p>
              
              <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#E6F4FE]">
                <QRCodeSVG 
                  value={`${window.location.origin}/public/receipt/${completedOrder._id}`}
                  size={160}
                  level={"H"}
                />
              </div>

              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setCompletedOrder(null);
                }}
                className="mt-6 w-full bg-[#0D1B2A] hover:bg-[#1B365D] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all uppercase tracking-wider text-sm active:scale-95"
              >
                Done / New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;