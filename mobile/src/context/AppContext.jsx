import React, { createContext, useContext, useEffect, useState } from "react";
// Remove react-router-dom and replace with React Navigation if needed
// import { useNavigation } from "@react-navigation/native"; 

// Use a React Native compatible toast or alert system
import Toast from 'react-native-toast-message'; 
import axios from "axios";
import dayjs from "dayjs";

// Adjust your base URL based on your React Native environment setup
// (e.g., process.env.EXPO_PUBLIC_BACKEND_URL if using Expo)
axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
axios.defaults.withCredentials = true;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [isOwner, setIsOwner] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(undefined);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [showCheckoutBox, setShowCheckoutBox] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState(false);

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [startDate, setStartDate] = useState(dayjs(thirtyDaysAgo));
    const [endDate, setEndDate] = useState(dayjs(today));

    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
        paidRevenue: 0,
    });

    

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth');
            if (data.success) {
                setUser(data.user);
                setIsSignedIn(true);
            } else {
                Toast.show({ type: 'error', text1: data.message });
            }
        } catch (error) {
            setUser(null);
            setIsSignedIn(false);
            setShowUserLogin(true);
        }
    };

    // useEffect(() => {
    //     fetchUser();
    // }, []);

    const value = {
        showProfile, setShowProfile, startDate, setStartDate, endDate, setEndDate, isSignedIn, 
        setIsSignedIn, showUserLogin, setShowUserLogin, user, setUser, isOwner, setIsOwner, 
        dashboardData, setDashboardData, allProducts, setAllProducts, currentPage, setCurrentPage,
        totalPages, setTotalPages, cartItems, setCartItems, showCheckoutBox, setShowCheckoutBox, 
        filteredProducts, setFilteredProducts, totalItems, setTotalItems, search, setSearch
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);