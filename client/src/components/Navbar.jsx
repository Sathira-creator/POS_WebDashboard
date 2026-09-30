import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowProfile, user } = useAppContext();

  // Sync active tab automatically based on current URL path
  const [activeTab, setActiveTab] = useState('POS');

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('inventory')) setActiveTab('INVENTORY');
    else if (path.includes('reports')) setActiveTab('REPORTS');
    else if (path.includes('chatbot')) setActiveTab('CHATBOT');
    else setActiveTab('POS');
  }, [location.pathname]);

  const tabs = ['POS', 'INVENTORY', 'REPORTS', 'CHATBOT'];

  return (
    <nav className="grid grid-cols-3 items-center w-full px-8 py-4 bg-white border-b border-gray-100 shadow-sm">

      {/* Left Side: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#0D1B2A] to-[#0070F3] flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider">
          M
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[#0D1B2A] text-lg tracking-tight leading-none">MerchGrid</span>
          <span className="text-[10px] font-bold text-[#0070F3] tracking-widest uppercase mt-0.5">POS System</span>
        </div>
      </div>

      {/* Center: Navigation Pills */}
      <div className='flex justify-center'>
        <div className="flex items-center p-1.5 bg-gray-100/80 rounded-full border border-gray-200/60 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                navigate(`/${tab.toLowerCase()}`);
              }}
              className={`px-7 py-2.5 text-xs font-extrabold tracking-wider transition-all duration-200 rounded-full ${activeTab === tab
                ? 'bg-linear-to-r from-[#0D1B2A] to-[#1B365D] text-white shadow-md shadow-slate-900/10'
                : 'text-gray-600 hover:text-[#0D1B2A] hover:bg-white/60'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: User Profile */}
      <div className='flex justify-end'>
        <div
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3.5 px-4 py-2 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/70 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm group"
        >
          {/* Avatar Container */}
          <div className="w-9 h-9 bg-linear-to-br from-[#0070F3] to-[#208AEF] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User Name & Role */}
          <div className="flex flex-col text-left">
            <span className="font-bold text-[#0D1B2A] text-sm leading-tight group-hover:text-[#0070F3] transition-colors">
              {user?.name || 'User Account'}
            </span>
            <span className="text-[11px] font-medium text-gray-400 capitalize">
              {user?.position || 'Staff Member'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;