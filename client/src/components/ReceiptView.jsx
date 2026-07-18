import React from 'react';

export default function ReceiptView({ order }) {
  return (
    <div className="w-full max-w-sm bg-white p-6 font-mono text-xs text-black shadow-md border-t-4 border-dashed border-gray-300">
      {/* Header section */}
      <div className="text-center mb-4">
        <h2 className="text-base font-black tracking-wider uppercase">DRIVE POS MINIMART</h2>
        <p className="text-gray-500">Kandy, Sri Lanka</p>
        <p className="text-[10px] text-gray-400">Invoice: {order.orderNumber}</p>
        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
      </div>
      
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      {/* Items List Grid mapping backend structure fields */}
      <div className="space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between font-bold">
              <span>{item.itemName}</span>
              <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
            </div>
            <div className="text-gray-500 text-[10px] pl-2">
              {item.quantity} x ${item.unitPrice.toFixed(2)} 
              {item.discountPercentage > 0 && ` (-${item.discountPercentage}%)`}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      {/* Pricing Totals Column Layout */}
      <div className="space-y-1 font-bold">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.totalDiscount > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Discount Applied:</span>
            <span>-${order.totalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-1">
          <span>NET TOTAL:</span>
          <span>${order.netTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-b border-dashed border-gray-400 my-2"></div>
      
      {/* Cash management metadata tracking fields */}
      <div className="text-[10px] space-y-0.5 text-gray-600">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="uppercase font-bold">{order.paymentMethod}</span>
        </div>
        {order.paymentMethod === 'cash' && (
          <>
            <div className="flex justify-between">
              <span>Cash Tendered:</span>
              <span>${order.cashReceived?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-black">
              <span>Change Returned:</span>
              <span>${order.changeGiven?.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div className="text-center mt-6 text-gray-400 text-[10px] italic">
        Thank you for shopping with us!
      </div>
    </div>
  );
}