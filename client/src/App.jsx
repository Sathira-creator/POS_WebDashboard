import React from 'react'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import PosPage from './pages/PosPage'
import InventoryPage from './pages/InventoryPage'
import ReportPage from './pages/ReportPage'
import { useAppContext } from './context/AppContext'
import Profile from './components/Profile'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import CheckoutBox from './components/CheckoutBox'
import PublicReceipt from './pages/PublicReceipt'


const CashierLayout = () => {
    return (
      <>
        <Toaster/>
        <Navbar />
        <div className='min-h-[70vh]'>
          <Outlet />
        </div>
      </>
    );
  };

const App = () => {

  const {showProfile, setShowProfile, showUserLogin, isSignedIn, showCheckoutBox} = useAppContext();
  return (
    <>
      {showProfile && <Profile/>}
      {showCheckoutBox &&  <CheckoutBox/>}

      <Routes>
        {/* Public View*/}
        <Route path="/public/receipt/:orderId" element={<PublicReceipt />} />

        {/* Cashier Views */}
        <Route element={<CashierLayout />}>
          <Route path='/' element={isSignedIn ? <Navigate to="/pos" replace /> : <Login />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/pos' element={<PosPage />} />
            <Route path='/inventory' element={<InventoryPage />} />
            <Route path='/reports' element={<ReportPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App