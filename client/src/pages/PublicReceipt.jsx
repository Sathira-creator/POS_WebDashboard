// src/pages/PublicReceipt.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReceiptView from '../components/ReceiptView';

export default function PublicReceipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await axios.get(`/api/order/public/${orderId}`);
        if (data.success) setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [orderId]);

  if (loading) return <div className="p-8 text-center font-bold font-mono">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-red-500 font-bold font-mono">Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 flex flex-col items-center justify-start gap-4">
      
      {/* Action Control Panel (Hidden when printing) */}
      <div className="w-full max-w-sm flex gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-[#3F64BE] hover:bg-[#3453a1] text-white font-bold py-3 rounded-xl shadow combined-transition flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
        >
          📄 Download / Save PDF
        </button>
      </div>

      {/* Reusable Visual Layout component */}
      <ReceiptView order={order} />
    </div>
  );
}