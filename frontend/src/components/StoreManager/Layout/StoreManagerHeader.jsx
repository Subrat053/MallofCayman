import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../../server";
import { FiUser, FiBell, FiLogOut, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";

const StoreManagerHeader = () => {
  const { user } = useSelector((state) => state.user);
  const [shopData, setShopData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch managed shop
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await axios.get(
          `${server}/store-manager/my-managed-shop`,
          { withCredentials: true }
        );
        if (data.success) {
          setShopData(data.shop);
        }
      } catch (error) {
        console.log("Error fetching shop:", error);
      }
    };

    if (user?.role === "store_manager") {
      fetchShop();
    }
  }, [user]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-4">
          <Link
            to="/store-manager/dashboard"
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">Store Manager</h1>
              {shopData && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  Managing: {shopData.name}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <FiBell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <FiUser className="text-emerald-600" size={16} />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || "Store Manager"}
              </span>
              <FiChevronDown
                className={`text-gray-500 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
                size={16}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="mt-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Store Manager
                      </span>
                    </div>
                  </div>

                  {shopData && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Managing Store:</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {shopData.name}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <FiLogOut size={16} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerHeader;
