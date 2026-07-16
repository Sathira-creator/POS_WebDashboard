import React from 'react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';               
import toast from 'react-hot-toast';

const Profile = () => {
    const {showProfile, setShowProfile, isSignedIn, setIsSignedIn, showUserLogin, setShowUserLogin, user, setUser,navigate} = useAppContext();

    const handleActionClick = async () => {
        if (isSignedIn) {
            try {
                // Send request to backend to clean up cookies
                const { data } = await axios.get(`/api/user/logout`);
                
                if (data.success) {
                    // Update frontend state ONLY on successful backend response
                    setIsSignedIn(false);
                    setUser(null); // Clear out the cache profile data
                    setShowProfile(false);
                    navigate('/pos');
                    toast.success("Successfully logged out");
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message);
            }
        } else {
            // Handle Log In logic
            setShowUserLogin(true);
            setShowProfile(false); 
        }
    };
  return (
    <div onClick={()=> setShowProfile(false)} className='fixed cursor-pointer inset-0 z-30 flex justify-end items-start p-16 bg-black/50'>
        {/* Main Card Container */}
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-[#E5E5E5] rounded-xl p-8 shadow-sm">
            
            {/* Header Section: Avatar and Info */}
            <div className="flex items-start gap-4 mb-20">
            {/* Avatar Placeholder */}
            <div className="bg-white p-2 rounded-sm">
                
            </div>
            
            {/* User Details */}
            <div className="flex flex-col">
                {isSignedIn && (
                    <>
                        <h2 className="text-xl font-bold text-black leading-tight">
                        {user?.name || "User Name"}
                        </h2>
                        <p className="text-md font-semibold text-black leading-tight">
                        {user?.position || "User Position" }
                        </p>
                    </>
                )}

            </div>
            </div>

            {/* Action Button */}
            <button 
                className="w-full bg-[#FF5A5A] hover:bg-[#ef4444] text-white font-bold py-4 rounded-full text-2xl tracking-widest transition-colors uppercase"
                onClick={handleActionClick}
                >
                {isSignedIn? `Log Out` : `Log In`}
            </button>
        </div>
    </div>
  )
}

export default Profile