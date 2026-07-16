import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('POS');
  const navigate = useNavigate();
  const {setShowProfile, user} = useAppContext();

  const tabs = ['POS', 'INVENTORY', 'REPORTS'];

  return (
    <nav className="grid grid-cols-3 items-center w-full p-4 bg-white">

      <div></div>
      {/* Left Side: Navigation Pills */}
      <div className='flex justify-center'>
        <div className="flex items-center p-1 bg-cyan-100/50 rounded-full border border-cyan-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {setActiveTab(tab); navigate(`/${tab.toLowerCase()}`);}}
              className={`px-8 py-2 text-sm font-bold transition-all duration-200 rounded-full border-2 ${
                activeTab === tab
                  ? 'bg-[#4466BB] text-white border-[#4466BB]'
                  : 'text-black border-transparent hover:border-[#4466BB]/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: User Profile */}
      <div className='flex justify-end cursor-pointer'>
        <div className="flex items-center gap-3 px-4 py-2 bg-cyan-100/50 rounded-full"
          onClick={() => setShowProfile(true)}
        >
          <div className="bg-white p-1">
            <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center">
              
            </div>
          </div>
          <span className="font-bold text-gray-900 pr-2">{user?.name}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;