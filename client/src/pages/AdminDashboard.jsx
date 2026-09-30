import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDollarSign, FiShoppingBag, FiBox, FiUsers, FiPlus, FiLogOut } from 'react-icons/fi';

const withCreds = { withCredentials: true };

const AdminDashboard = () => {
    const { user, setUser, setIsSignedIn, navigate } = useAppContext();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'orders'
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalStaff: 0
    });
    const [workers, setWorkers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersFetched, setOrdersFetched] = useState(false);

    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [workerName, setWorkerName] = useState('');
    const [workerEmail, setWorkerEmail] = useState('');
    const [workerPassword, setWorkerPassword] = useState('');
    const [workerPosition, setWorkerPosition] = useState('Cashier');

    // Clears local state and sends the user back to the home page
    const endSession = () => {
        localStorage.removeItem('activeShopId');
        setIsSignedIn(false);
        setUser(null);
        navigate('/');
    };

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const activeShopId = localStorage.getItem('activeShopId');
            if (!activeShopId) return;

            const headers = { 'x-shop-id': activeShopId };
            const { data } = await axios.get('/api/order/orderlist', { headers, ...withCreds });

            if (data.success) {
                const ordersList = data.orders || data.items || [];
                setOrders(ordersList);
                setOrderCount(data.count);
                setOrdersFetched(true);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                endSession();
                return;
            }
            toast.error(error.response?.data?.message || "Failed to load orders");
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const activeShopId = localStorage.getItem('activeShopId');

            if (!activeShopId) {
                toast.error("No active shop selected.");
                navigate('/');
                return;
            }

            const headers = { 'x-shop-id': activeShopId };

            const [inventoryResult, shopResult] = await Promise.allSettled([
                axios.get('/api/inventory', { headers, ...withCreds }),
                axios.get('/api/shop/details', { headers, ...withCreds })
            ]);

            const unauthorized = [inventoryResult, shopResult].some(
                (r) => r.status === 'rejected' && r.reason?.response?.status === 401
            );
            if (unauthorized) {
                toast.error("Session expired. Please log in again.");
                endSession();
                return;
            }

            let productsCount = 0;
            if (inventoryResult.status === 'fulfilled' && inventoryResult.value.data.success) {
                productsCount = inventoryResult.value.data.items.length;
            } else {
                console.error('Inventory failed:', inventoryResult.reason?.response?.data || inventoryResult.reason);
            }

            let staffList = [];
            if (shopResult.status === 'fulfilled' && shopResult.value.data.success) {
                staffList = shopResult.value.data.shop?.users || [];
            } else {
                console.error('Shop details failed:', shopResult.reason?.response?.data || shopResult.reason);
                toast.error("Could not load staff list.");
            }

            setWorkers(staffList);
            setStats(prev => ({
                ...prev,
                totalProducts: productsCount,
                totalStaff: staffList.length
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load dashboard metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'orders' && !ordersFetched) {
            fetchOrders();
        }
    };

    const handleAddWorker = async (e) => {
        e.preventDefault();
        try {
            const activeShopId = localStorage.getItem('activeShopId');
            const { data } = await axios.post('/api/user/add-worker', {
                name: workerName,
                email: workerEmail,
                password: workerPassword,
                position: workerPosition
            }, {
                headers: { 'x-shop-id': activeShopId },
                ...withCreds
            });

            if (data.success) {
                toast.success("Worker added successfully!");
                setShowAddWorkerModal(false);
                setWorkerName('');
                setWorkerEmail('');
                setWorkerPassword('');
                setWorkerPosition('Cashier');
                fetchDashboardData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/user/logout', {}, withCreds);
        } catch (error) {
            console.error('Logout request failed:', error.message);
        } finally {
            endSession();
            toast.success("Logged out successfully");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 text-[#0D1B2A] font-bold text-sm">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col justify-between p-6 shadow-2xs">
                <div>
                    <h1 className="text-xl font-black text-[#0D1B2A] mb-8 tracking-wider uppercase">POS Manager</h1>
                    <nav className="flex flex-col gap-2">
                        <button 
                            onClick={() => handleTabChange('dashboard')} 
                            className={`flex items-center gap-3 p-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${
                                activeTab === 'dashboard' 
                                    ? 'bg-blue-50/50 text-[#0070F3] border-blue-100' 
                                    : 'text-gray-500 hover:bg-gray-50 border-transparent'
                            }`}
                        >
                            <FiShoppingBag size={18} /> Dashboard
                        </button>
                        <button 
                            onClick={() => handleTabChange('orders')} 
                            className={`flex items-center gap-3 p-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${
                                activeTab === 'orders' 
                                    ? 'bg-blue-50/50 text-[#0070F3] border-blue-100' 
                                    : 'text-gray-500 hover:bg-gray-50 border-transparent'
                            }`}
                        >
                            <FiDollarSign size={18} /> Orders
                        </button>
                        <button onClick={() => navigate('/pos')} className="flex items-center gap-3 p-3.5 text-gray-500 hover:bg-gray-50 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-transparent">
                            <FiBox size={18} /> POS Terminal
                        </button>
                    </nav>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-3 p-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-transparent hover:border-rose-100">
                    <FiLogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Top Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            {activeTab === 'dashboard' ? 'Overview' : 'Transactions'}
                        </span>
                        <h2 className="text-2xl font-black text-[#0D1B2A]">
                            {activeTab === 'dashboard' ? `Welcome, ${user?.name || 'Admin'}` : 'Shop Orders'}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {activeTab === 'dashboard' ? 'Manage your branch staff and inventory from here.' : 'View all customer orders and purchase records.'}
                        </p>
                    </div>
                    {activeTab === 'dashboard' && (
                        <button 
                            onClick={() => setShowAddWorkerModal(true)} 
                            className="flex items-center gap-2 bg-[#0070F3] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 transition-all cursor-pointer shadow-xs shadow-blue-500/20"
                        >
                            <FiPlus size={16} /> Add Worker
                        </button>
                    )}
                </header>

                {activeTab === 'dashboard' ? (
                    <>
                        {/* Analytics Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                            

                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black tracking-wider text-purple-600 uppercase mb-0.5">Staff Members</p>
                                    <h3 className="text-xl font-black text-[#0D1B2A]">{stats.totalStaff}</h3>
                                </div>
                                <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100/50">
                                    <FiUsers size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Staff Members List Section */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs mb-8">
                            <h3 className="text-xs font-black text-[#0D1B2A] uppercase tracking-wider mb-4">Branch Staff Members</h3>
                            {workers.length === 0 ? (
                                <div className="items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No workers assigned to this shop yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-black uppercase tracking-wider">
                                                <th className="py-3 px-4">Name</th>
                                                <th className="py-3 px-4">Email</th>
                                                <th className="py-3 px-4">Position</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-xs">
                                            {workers.map((worker) => (
                                                <tr key={worker._id || worker.email} className="hover:bg-gray-50/50">
                                                    <td className="py-3.5 px-4 font-black text-[#0D1B2A]">{worker.name}</td>
                                                    <td className="py-3.5 px-4 font-medium text-gray-600">{worker.email}</td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="bg-blue-50 text-[#0070F3] px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100">
                                                            {worker.position || 'Cashier'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Orders List Section */
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs mb-8">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black tracking-wider text-blue-600 uppercase mb-0.5">Orders Processed</p>
                                    <h3 className="text-xl font-black text-[#0D1B2A]">{orderCount}</h3>
                                </div>
                                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50">
                                    <FiShoppingBag size={20} />
                                </div>
                            </div>

                        </div>

                            
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-[#0D1B2A] uppercase tracking-wider">All Branch Orders</h3>
                            <button 
                                onClick={fetchOrders}
                                className="text-[11px] font-black uppercase tracking-wider text-[#0070F3] hover:underline"
                            >
                                Refresh Orders
                            </button>
                        </div>
                        {ordersLoading ? (
                            <div className="items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No orders found for this shop yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[11px] text-gray-400 font-black uppercase tracking-wider">
                                            <th className="py-3 px-4">Order ID</th>
                                            <th className="py-3 px-4">Cashier</th>
                                            <th className="py-3 px-4">Total Amount</th>
                                            <th className="py-3 px-4">Payment Method</th>
                                            <th className="py-3 px-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-xs">
                                        {orders.map((order) => (
                                            <tr key={order._id || order.id} className="hover:bg-gray-50/50">
                                                <td className="py-3.5 px-4 font-black text-[#0D1B2A]">
                                                    #{order.orderNumber || (order._id ? order._id.slice(-6).toUpperCase() : 'N/A')}
                                                </td>
                                                {/* Display Cashier Name */}
                                                <td className="py-3.5 px-4 font-medium text-gray-600">
                                                    {order.cashierId?.name || 'Walk-in Cashier'}
                                                </td>
                                                {/* Fix Total Amount (netTotal) */}
                                                <td className="py-3.5 px-4 font-black text-emerald-600">
                                                    ${(order.netTotal || order.subtotal || 0).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border border-amber-100">
                                                        {order.paymentMethod || 'Cash'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-gray-500">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal: Add Worker */}
            {showAddWorkerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <form onSubmit={handleAddWorker} className="bg-white w-[400px] p-6 rounded-3xl shadow-xl flex flex-col gap-4 border border-gray-100">
                        <h3 className="text-sm font-black text-[#0D1B2A] uppercase tracking-wider">Add New Worker</h3>
                        
                        <div>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                            <input type="text" value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl mt-1 text-xs font-bold text-[#0D1B2A] outline-blue-500" required />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                            <input type="email" value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} placeholder="worker@shop.com" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl mt-1 text-xs font-bold text-[#0D1B2A] outline-blue-500" required />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Temporary Password</label>
                            <input type="password" value={workerPassword} onChange={(e) => setWorkerPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl mt-1 text-xs font-bold text-[#0D1B2A] outline-blue-500" required />
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Position / Role</label>
                            <input type="text" value={workerPosition} onChange={(e) => setWorkerPosition(e.target.value)} placeholder="Cashier / Storekeeper" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl mt-1 text-xs font-bold text-[#0D1B2A] outline-blue-500" required />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowAddWorkerModal(false)} className="px-4 py-2.5 text-xs font-black text-gray-500 hover:bg-gray-100 rounded-xl uppercase tracking-wider">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-[#0070F3] text-white font-black text-xs rounded-xl hover:bg-blue-600 uppercase tracking-wider shadow-xs shadow-blue-500/20">Save Worker</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;