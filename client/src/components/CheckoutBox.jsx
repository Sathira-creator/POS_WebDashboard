import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CheckoutBox = ({ subtotal, onConfirm }) => {

  const {showCheckoutBox, setShowCheckoutBox} = useAppContext();
  
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to cash
  const [cashReceived, setCashReceived] = useState('');

  // Automatically calculate change if cash is received
  const changeDue = cashReceived ? Number(cashReceived) - subtotal : 0;

  const handleCheckout = () => {
    if (paymentMethod === 'cash' && (!cashReceived || Number(cashReceived) < subtotal)) {
        toast.error("Please enter a valid cash amount equal to or greater than the subtotal.");
      return;
    }

    // Pass the checkout summary data back up
    onConfirm({
      paymentMethod,
      subtotal,
      totalDiscount: 0,
      netTotal: subtotal,
      cashReceived: paymentMethod === 'cash' ? Number(cashReceived) : 0,
      changeDue: paymentMethod === 'cash' ? changeDue : 0
    });
    setShowCheckoutBox(false);
  };

  const onClose = () => {
    setShowCheckoutBox(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-[#EFEFEF] rounded-3xl p-6 shadow-xl font-sans text-gray-800">
        
        {/* 1. Subtotal Display */}
        <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-wide">
            SUB TOTAL: <span className="text-black">${subtotal}</span>
            </h2>
        </div>

        {/* 2. Payment Method Selectors */}
        <div className="mb-6">
            <label className="block text-base font-black uppercase tracking-wider mb-2">
            Payment Method:
            </label>
            <div className="flex gap-6 items-center pl-2">
            <label className="flex items-center gap-2 text-xl font-bold cursor-pointer capitalize">
                <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 accent-[#3F64BE]"
                />
                cash
            </label>
            <label className="flex items-center gap-2 text-xl font-bold cursor-pointer capitalize">
                <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 accent-[#3F64BE]"
                />
                online
            </label>
            </div>
        </div>

        {/* 3. Conditional Cash Input & Change Balance */}
        {paymentMethod === 'cash' && (
            <div className="space-y-4 mb-6 transition-all animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
                <label className="text-base font-black uppercase tracking-wider whitespace-nowrap">
                Cash Received:
                </label>
                <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-lg font-bold text-right focus:outline-none focus:border-[#3F64BE]"
                />
            </div>

            {/* Useful addition: Let the cashier see the exact change instantly */}
            <div className="flex items-center justify-between border-t border-dashed border-gray-400 pt-2 text-sm font-bold text-gray-600">
                <span>Change Due:</span>
                <span className={`text-lg font-black ${changeDue >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                ${changeDue >= 0 ? changeDue.toFixed(2) : '0.00'}
                </span>
            </div>
            </div>
        )}

        {/* 4. Footer Actions */}
        <div className="flex justify-between gap-4 mt-4">
            <button
            onClick={handleCheckout}
            className="flex-1 bg-[#66FF4D] hover:bg-[#58e640] active:scale-95 text-white text-lg font-black py-2.5 rounded-full shadow transition-all uppercase"
            >
            Check Out
            </button>
            <button
            onClick={onClose}
            className="flex-1 bg-[#FF4D4D] hover:bg-[#eb4242] active:scale-95 text-white text-lg font-black py-2.5 rounded-full shadow transition-all uppercase"
            >
            Cancel
            </button>
        </div>

        </div>
    </div>
  );
};

export default CheckoutBox;