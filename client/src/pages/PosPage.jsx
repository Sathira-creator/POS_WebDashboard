import React from 'react'
import Keypad from '../components/Keypad'
import Cart from '../components/Cart'
import Profile from '../components/Profile'

const PosPage = () => {
  return (
    <div className='grid grid-cols-2 gap-6 p-6 h-[calc(100vh-80px)]'>
        <Cart/>
        <Keypad/>

    </div>
    
  )
}

export default PosPage