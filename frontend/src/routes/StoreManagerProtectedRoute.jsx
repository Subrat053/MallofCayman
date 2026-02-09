import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const StoreManagerProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is a store manager
  if (user?.role !== "store_manager") {
    return <Navigate to="/" replace />;
  }

  // Check if user has a managed shop assigned
  if (!user?.managedShop) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StoreManagerProtectedRoute;
