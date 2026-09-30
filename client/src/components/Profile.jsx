import React from 'react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const withCreds = { withCredentials: true };

const Profile = () => {
    const { showProfile, setShowProfile, isSignedIn, setIsSignedIn, showUserLogin, setShowUserLogin, user, setUser, navigate } = useAppContext();

    const handleActionClick = async () => {
        if (isSignedIn) {
            try {
                // Send request to backend to clean up cookies
                const { data } = await axios.get(`/api/user/logout`, withCreds);

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
        <div
            onClick={() => setShowProfile(false)}
            className='fixed cursor-pointer inset-0 z-50 flex justify-end items-start p-6 bg-black/40 backdrop-blur-xs animate-fade-in'
        >
            {/* Main Card Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 cursor-default mt-16 mr-4"
            >

                {/* Header Section: Avatar and Info */}
                <div className="flex items-center gap-4 mb-8">
                    {/* Dynamic Initial Avatar */}
                    <div className="w-14 h-14 bg-linear-to-br from-[#0070F3] to-[#208AEF] rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {/* User Details */}
                    <div className="flex flex-col">
                        {isSignedIn ? (
                            <>
                                <h2 className="text-lg font-black text-[#0D1B2A] leading-tight">
                                    {user?.name || "User Name"}
                                </h2>
                                <span className="text-xs font-bold text-[#0070F3] tracking-wide uppercase mt-1">
                                    {user?.position || user?.role || "Staff Member"}
                                </span>
                            </>
                        ) : (
                            <div className="flex flex-col">
                                <h2 className="text-lg font-black text-[#0D1B2A] leading-tight">Guest User</h2>
                                <span className="text-xs font-medium text-gray-400 mt-0.5">Please sign in to continue</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className={`w-full font-extrabold py-3.5 rounded-2xl text-sm tracking-wider transition-all shadow-sm cursor-pointer uppercase active:scale-98 ${isSignedIn
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60'
                        : 'bg-linear-to-r from-[#0070F3] to-[#208AEF] hover:from-[#005bb5] hover:to-[#1a73cc] text-white shadow-blue-500/25'
                        }`}
                    onClick={handleActionClick}
                >
                    {isSignedIn ? `Log Out` : `Log In`}
                </button>
            </div>
        </div>
    );
};

export default Profile;