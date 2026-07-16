import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = () => {
    const { isSignedIn } = useAppContext();

    if (isSignedIn === undefined) {
        return <Navigate to="/" replace />;
    }

    return isSignedIn ? <Outlet /> : <Navigate to="/pos" replace />;
};

export default ProtectedRoute;