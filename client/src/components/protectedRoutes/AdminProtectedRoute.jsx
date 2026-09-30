import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AdminProtectedRoute = () => {
  const { user, isSignedIn, loading } = useAppContext();

  // 1. Wait until authentication check completes
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-medium">
        Checking authentication...
      </div>
    );
  }

  // 2. If not signed in, redirect to login
  if (!isSignedIn || !user) {
    return <Navigate to="/" replace />;
  }

  // 3. Check position or role
  const position = user?.position ? user.position.toLowerCase() : '';
  const role = user?.role ? user.role.toLowerCase() : '';

  const isOwner = 
    position === 'owner' || 
    position === 'admin' || 
    role === 'owner' || 
    role === 'admin' || 
    user?.isAdmin === true || 
    user?.isOwner === true;

  if (!isOwner) {
    toast.error("Access denied. Owner privileges required.");
    return <Navigate to="/pos" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;