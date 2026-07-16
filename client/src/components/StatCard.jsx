import React from 'react'

/**
 * StatCard Component
 * @param {string} label - The title of the metric (e.g., "Total Sales")
 * @param {string} value - The numeric data to display (e.g., "Rs. 1,340,000.00")
 * @param {string} color - Tailwind class for the background (e.g., "bg-green-100")
 * @param {string} textColor - Tailwind class for the label text (e.g., "text-green-600")
 * @param {React.ReactNode} icon - The icon or symbol to display in the white box
 */

const StatCard = ({label, value, color, textColor, icon,onClick}) => {
  return (
    <div 
    onClick={onClick}
    className={`${color} p-5 rounded-2xl flex items-center shadow-sm border border-white/50 transition-transform hover:scale-[1.02]`}>
        {/* Icon Container */}
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mr-4">
            <span className={`text-2xl font-bold ${textColor}`}>
            {icon}
            </span>
        </div>

        {/* Text Content */}
        <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wide ${textColor} opacity-80`}>
            {label}
            </span>
            <span className="text-xl font-black text-gray-800">
            {value}
            </span>
        </div>
        </div>
    );
    };

export default StatCard