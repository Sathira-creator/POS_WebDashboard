import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const config = { withCredentials: true };
const Login = () => {
    const { setShowUserLogin, setUser, navigate, setIsSignedIn } = useAppContext();
    const [state, setState] = useState("login");

    const [name, setName] = useState("");
    const [position, setPosition] = useState("Owner");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [shopName, setShopName] = useState("");
    const [shopAddress, setShopAddress] = useState("");
    const [shopDistrict, setShopDistrict] = useState("");
    const [shopCity, setShopCity] = useState("");

    const [pendingShops, setPendingShops] = useState(null);

    // The server set a cookie at login; if we abandon the flow, clear it
    const clearSession = async () => {
        try {
            await axios.post('/api/user/logout', {}, config);
        } catch (e) {
            // ignore, nothing more to do
        }
        localStorage.removeItem('activeShopId');
        setUser(null);
        setIsSignedIn(false);
    };

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            if (state === "register") {
                const { data } = await axios.post('/api/shop/register', {
                    name,
                    position,
                    email,
                    password,
                    shopName,
                    address: shopAddress,
                    district: shopDistrict,
                    city: shopCity
                }, config);

                if (data.success) {
                    // Token is in the httpOnly cookie now, nothing to store
                    if (data.user.shops?.length > 0) {
                        localStorage.setItem('activeShopId', data.user.shops[0]._id);
                    }
                    setUser(data.user);
                    setIsSignedIn(true);
                    setShowUserLogin(false);
                    navigate('/pos');
                    toast.success("Shop & Owner registered successfully!");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post('/api/user/login', { email, password }, config);

                if (data.success) {
                    const userShops = data.user.shops || [];

                    if (userShops.length === 0) {
                        // Cookie was already set by the server, so clear it
                        await clearSession();
                        toast.error("This account is not assigned to any shop.");
                        return;
                    }

                    if (userShops.length === 1) {
                        localStorage.setItem('activeShopId', userShops[0]._id);
                        setUser(data.user);
                        setIsSignedIn(true);
                        setShowUserLogin(false);
                        navigate('/pos');
                        toast.success("Successfully logged in!");
                    } else {
                        setPendingShops(userShops);
                        setUser(data.user);
                    }
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleSelectShop = (shopId) => {
        localStorage.setItem('activeShopId', shopId);
        setIsSignedIn(true);
        setShowUserLogin(false);
        setPendingShops(null);
        navigate('/pos');
        toast.success("Shop selected successfully!");
    };

    // Closing the modal mid-way through branch selection would leave a
    // logged-in cookie with no active shop, so end the session in that case
    const handleClose = async () => {
        if (pendingShops) {
            await clearSession();
            setPendingShops(null);
        }
        setShowUserLogin(false);
    };

    return (
        <div onClick={() => setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50 backdrop-blur'>
            
            {/* BRANCH SELECTOR VIEW: Shown if the authenticated user has access to multiple shops */}
            {pendingShops ? (
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-center p-8 py-12 w-80 sm:w-[380px] rounded-lg shadow-xl border border-gray-200 bg-white">
                    <p className="text-2xl font-medium text-center">Select Branch</p>
                    <p className="text-gray-500 text-xs text-center mb-2">You have access to multiple shops. Choose one to continue:</p>
                    
                    <div className="w-full flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                        {pendingShops.map((shop) => (
                            <button
                                key={shop._id}
                                onClick={() => handleSelectShop(shop._id)}
                                className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-primary transition-all flex flex-col"
                            >
                                <span className="font-semibold text-gray-800">{shop.name}</span>
                                <span className="text-xs text-gray-400">
                                    {[shop.address, shop.city, shop.district].filter(Boolean).join(", ") || "No location details"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* LOGIN & SHOP REGISTRATION FORM */
                <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 m-auto items-start p-6 py-8 w-80 sm:w-[400px] rounded-lg shadow-xl border border-gray-200 bg-white max-h-[90vh] overflow-y-auto">
                    <p className="text-2xl font-medium m-auto">
                        <span className="text-primary">{state === "register" ? "Register Shop" : "User"}</span> {state === "login" ? "Login" : ""}
                    </p>
                    
                    {state === "register" && (
                        <>
                            <div className="w-full">
                                <p className="font-medium text-xs text-gray-500">Your Name</p>
                                <input onChange={(e) => setName(e.target.value)} value={name} placeholder="e.g. John Doe" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                            </div>

                            <div className="w-full">
                                <p className="font-medium text-xs text-gray-500">Position / Role</p>
                                <input onChange={(e) => setPosition(e.target.value)} value={position} placeholder="e.g. Owner" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                            </div>

                            <div className="w-full">
                                <p className="font-medium text-xs text-gray-500">Shop Name</p>
                                <input onChange={(e) => setShopName(e.target.value)} value={shopName} placeholder="e.g. Downtown Branch" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                            </div>

                            <div className="w-full">
                                <p className="font-medium text-xs text-gray-500">Shop Address</p>
                                <input onChange={(e) => setShopAddress(e.target.value)} value={shopAddress} placeholder="e.g. 123 Main Street" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" />
                            </div>

                            <div className="flex gap-2 w-full">
                                <div className="flex-1">
                                    <p className="font-medium text-xs text-gray-500">City</p>
                                    <input onChange={(e) => setShopCity(e.target.value)} value={shopCity} placeholder="e.g. Colombo" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-xs text-gray-500">District</p>
                                    <input onChange={(e) => setShopDistrict(e.target.value)} value={shopDistrict} placeholder="e.g. Western" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="w-full">
                        <p className="font-medium text-xs text-gray-500">Email</p>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
                    </div>

                    <div className="w-full">
                        <p className="font-medium text-xs text-gray-500">Password</p>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
                    </div>

                    {state === "register" ? (
                        <p className="text-xs">
                            Already have an account? <span onClick={() => setState("login")} className="text-primary cursor-pointer font-medium">Login here</span>
                        </p>
                    ) : (
                        <p className="text-xs">
                            Want to register a new shop? <span onClick={() => setState("register")} className="text-primary cursor-pointer font-medium">Click here</span>
                        </p>
                    )}

                    <button className="bg-primary hover:bg-red-700 transition-all text-black w-full py-2.5 rounded-md cursor-pointer font-medium mt-2">
                        {state === "register" ? "Create Shop & Account" : "Login"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Login;