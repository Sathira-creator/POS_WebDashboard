import React from 'react'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate } from 'react-router-dom'
import PosPage from './pages/PosPage'
import InventoryPage from './pages/InventoryPage'
import ReportPage from './pages/ReportPage'
import { useAppContext } from './context/AppContext'
import Profile from './components/Profile'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'


const App = () => {

  const {showProfile, setShowProfile, showUserLogin, isSignedIn} = useAppContext();
  return (
    <>
      <Toaster/>
      <Navbar />
      {showProfile && <Profile/>}
      {/* {showUserLogin && !isSignedIn ? <Login/> : null} */}

      <div className='min-h-[70vh]'>
            <Routes>
              <Route path='/' element={isSignedIn ? <Navigate to="/pos" replace /> : <Login />} />
              <Route element={<ProtectedRoute/>}>
                
                <Route path='/pos' element={<PosPage/>} />
                <Route path='/inventory' element={<InventoryPage/>} />
                <Route path='/reports' element={<ReportPage/>} />
              </Route>
            </Routes>
      </div>
    </>
  )
}

export default App