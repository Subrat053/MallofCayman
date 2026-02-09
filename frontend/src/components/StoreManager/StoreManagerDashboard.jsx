import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiGift,
} from "react-icons/fi";
import { AiOutlineFolderAdd, AiOutlineShop } from "react-icons/ai";
import { HiExclamationCircle, HiOutlineBadgeCheck } from "react-icons/hi";
import { MdStorefront } from "react-icons/md";
import { logoutUser } from "../../redux/actions/user";
import Loader from "../Layout/Loader";

const StoreManagerDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
    lowStockItems: [],
  });

  // Fetch managed shop data
  useEffect(() => {
    const fetchManagedShop = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${server}/store-manager/my-managed-shop`,
          { withCredentials: true },
        );

        if (data.success) {
          setShopData(data.shop);
          // Fetch stats for the shop
          await fetchShopStats(data.shop._id);
        }
      } catch (error) {
        console.error("Error fetching managed shop:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("You are not assigned as a store manager");
          navigate("/");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to load shop data",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "store_manager") {
      fetchManagedShop();
    } else {
      toast.error("Unauthorized access");
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch shop statistics
  const fetchShopStats = async (shopId) => {
    try {
      // Fetch products
      const productsRes = await axios.get(
        `${server}/product/get-all-products-shop/${shopId}`,
        { withCredentials: true },
      );
      const products = productsRes.data?.products || [];

      // Calculate product stats
      const activeProducts = products.filter(
        (p) => p.isActive !== false,
      ).length;
      const lowStockProducts = products.filter(
        (p) => p.stock <= (p.lowStockThreshold || 5),
      ).length;
      const lowStockItems = products
        .filter((p) => p.stock <= (p.lowStockThreshold || 5))
        .slice(0, 5)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          threshold: p.lowStockThreshold || 5,
        }));

      // Fetch orders for this shop
      const ordersRes = await axios.get(
        `${server}/order/get-seller-all-orders/${shopId}`,
        { withCredentials: true },
      );
      const orders = ordersRes.data?.orders || [];

      // Calculate order stats
      const pendingOrders = orders.filter(
        (o) => o.status === "Processing" || o.status === "Pending",
      ).length;
      const processingOrders = orders.filter(
        (o) =>
          o.status === "Transferred to delivery partner" ||
          o.status === "Shipping",
      ).length;
      const deliveredOrders = orders.filter(
        (o) => o.status === "Delivered",
      ).length;

      // Recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber || o._id.slice(-8).toUpperCase(),
          total: o.totalPrice,
          status: o.status,
          createdAt: o.createdAt,
        }));

      setStats({
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        totalOrders: orders.length,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        recentOrders,
        lowStockItems,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Shop Assigned
          </h2>
          <p className="text-gray-600">
            You are not currently assigned to manage any shop.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Store Manager Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Managing: {shopData.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Store Manager
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {user?.name}!
              </h2>
              <p className="text-blue-100">
                You are managing <strong>{shopData.name}</strong>. You can
                manage products, inventory, and orders.
              </p>
            </div>
            <AiOutlineShop className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* In-House Store / Ad Fee Exempt Banner */}
        {(shopData.isInHouseStore || shopData.adFeeExempt) && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 mb-8 text-white">
            <div className="flex items-center space-x-3">
              {shopData.isInHouseStore ? (
                <MdStorefront className="w-8 h-8 text-purple-200" />
              ) : (
                <HiOutlineBadgeCheck className="w-8 h-8 text-purple-200" />
              )}
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {shopData.isInHouseStore ? (
                    <>🏪 IN-HOUSE STORE</>
                  ) : (
                    <>✨ VIP PARTNER STORE</>
                  )}
                </h3>
                <p className="text-purple-200 text-sm">
                  {shopData.adFeeExempt
                    ? "This store is exempt from advertising fees. You can create ads for free!"
                    : shopData.inHouseStoreNote ||
                      "Platform-owned store with special privileges."}
                  {shopData.adFeeExemptReason && (
                    <span className="ml-1">({shopData.adFeeExemptReason})</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Restrictions Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Limited Access Mode
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                As a Store Manager, you can manage products, inventory, and
                orders. You cannot access payment settings, store configuration,
                or issue refunds.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.activeProducts} active
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.lowStockProducts}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    stats.lowStockProducts > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {stats.lowStockProducts > 0
                    ? "Needs attention"
                    : "All stocked"}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${
                  stats.lowStockProducts > 0 ? "bg-red-100" : "bg-green-100"
                } rounded-lg flex items-center justify-center`}
              >
                <HiExclamationCircle
                  className={`w-6 h-6 ${
                    stats.lowStockProducts > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.deliveredOrders} delivered
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.pendingOrders}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats.processingOrders} shipping
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/store-manager/products"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">View Products</span>
              <span className="text-sm text-gray-500 mt-1">
                Manage inventory
              </span>
            </Link>

            <Link
              to="/store-manager/create-product"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <AiOutlineFolderAdd className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Add Product</span>
              <span className="text-sm text-gray-500 mt-1">
                Create new listing
              </span>
            </Link>

            <Link
              to="/store-manager/orders"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <FiShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">View Orders</span>
              <span className="text-sm text-gray-500 mt-1">Process orders</span>
            </Link>

            <Link
              to="/store-manager/inventory"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <HiExclamationCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="font-medium text-gray-900">Inventory</span>
              <span className="text-sm text-gray-500 mt-1">Stock levels</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
              <Link
                to="/store-manager/orders"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${order.total?.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Low Stock Alerts
              </h3>
              <Link
                to="/store-manager/inventory"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>
            {stats.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-red-600">
                        Threshold: {item.threshold} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {item.stock}
                      </p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiPackage className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-500">All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreManagerDashboard;
