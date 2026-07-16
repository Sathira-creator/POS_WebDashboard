import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast'
import axios from "axios";

axios.defaults.withCredentials = true ;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;


const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate();

    const [isOwner, setIsOwner] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [isSignedIn, setIsSignedIn] = useState(undefined)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [user, setUser] = useState(null)
    const [allProducts, setAllProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cartItems, setCartItems] = useState([]);

    const [value1, setValue1] = useState();
    const [value2, setValue2] = useState();

    const [dashboardData, setDashboardData] = useState({
            bookings: [],
            totalBookings: 0,
            totalRevenue: 0,
            paidRevenue: 0,
        })

    const fetchAllProducts = async ()=>{
        try {
            const {data} = await axios.get('/api/inventory/list', {
                params: {
                page: currentPage
            }
            });

            if(data.success){
                setAllProducts(data.inventory)
                setTotalPages(data.totalPages)
            }else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

     const fetchUser = async ()=>{
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if (data.success){
                setUser(data.user);
                setIsSignedIn(true);
                
            }
        } catch (error) {
            setUser(null);
            setIsSignedIn(false);
            setShowUserLogin(true);
        }
    }

    useEffect(()=>{
        fetchUser();
        
    },[])


    // useEffect(()=>{
    //     fetchRooms();
    // },[])

    const value = {
        showProfile, setShowProfile,value1, setValue1, value2, setValue2,isSignedIn, 
        setIsSignedIn, showUserLogin, setShowUserLogin, user, setUser, isOwner, setIsOwner, 
        dashboardData, setDashboardData, navigate, allProducts, setAllProducts, currentPage, setCurrentPage,
        totalPages, setTotalPages, cartItems, setCartItems
    }

    return (
        <AppContext.Provider value={value} >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)