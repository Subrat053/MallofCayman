import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import {
  FiUsers,
  FiSearch,
  FiEdit,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiDollarSign,
  FiShield,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { AiOutlineShop } from "react-icons/ai";
import Loader from "../components/Layout/Loader";

const AdminStoreManagerPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    suspended: 0,
    revenue: 0,
    withManagers: 0,
  });
  const [showFreeServiceModal, setShowFreeServiceModal] = useState(false);
  const [selectedShopForFree, setSelectedShopForFree] = useState("");
  const [freeServiceDuration, setFreeServiceDuration] = useState(1);
  const [allShops, setAllShops] = useState([]);

  // Fetch all store manager services
  useEffect(() => {
    fetchServices();
    fetchAllShops();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/store-manager/admin/all-services`,
        { withCredentials: true }
      );

      if (data.success) {
        setServices(data.services);

        // Calculate stats
        const active = data.services.filter(
          (s) =>
            s.serviceStatus === "active" &&
            (!s.subscriptionEndDate ||
              new Date(s.subscriptionEndDate) > new Date())
        ).length;
        const expired = data.services.filter(
          (s) =>
            s.serviceStatus === "expired" ||
            (s.subscriptionEndDate &&
              new Date(s.subscriptionEndDate) < new Date())
        ).length;
        const suspended = data.services.filter(
          (s) => s.serviceStatus === "suspended"
        ).length;
        const withManagers = data.services.filter(
          (s) => s.assignedManager
        ).length;
        const revenue = data.services
          .filter((s) => s.purchaseInfo?.paymentMethod !== "admin_granted")
          .reduce((sum, s) => {
            // Sum all payment history for monthly subscriptions
            const historyTotal =
              s.paymentHistory?.reduce((h, p) => h + (p.amount || 0), 0) || 0;
            return sum + historyTotal + (s.purchaseInfo?.amount || 0);
          }, 0);

        setStats({
          total: data.services.length,
          active,
          expired,
          suspended,
          revenue,
          withManagers,
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load store manager services");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllShops = async () => {
    try {
      const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
        withCredentials: true,
      });
      if (data.success) {
        setAllShops(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  // Toggle service suspension
  const handleToggleSuspension = async (serviceId, currentStatus) => {
    const shouldSuspend = currentStatus === "active";
    const action = shouldSuspend ? "suspend" : "restore";
    if (!window.confirm(`Are you sure you want to ${action} this service?`)) {
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/store-manager/admin/toggle-suspension/${serviceId}`,
        { suspend: shouldSuspend },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchServices(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update service");
    }
  };

  // Assign free service
  const handleAssignFreeService = async () => {
    if (!selectedShopForFree) {
      toast.error("Please select a shop");
      return;
    }

    try {
      const { data } = await axios.post(
        `${server}/store-manager/admin/assign-free-service`,
        {
          shopId: selectedShopForFree,
          durationMonths: freeServiceDuration,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(
          `Free ${freeServiceDuration}-month subscription assigned successfully!`
        );
        setShowFreeServiceModal(false);
        setSelectedShopForFree("");
        setFreeServiceDuration(1);
        fetchServices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign service");
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.assignedManager?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      service.serviceStatus === filterStatus ||
      (filterStatus === "expired" &&
        (service.serviceStatus === "expired" ||
          (service.subscriptionEndDate &&
            new Date(service.subscriptionEndDate) < new Date()))) ||
      (filterStatus === "with_manager" && service.assignedManager) ||
      (filterStatus === "without_manager" && !service.assignedManager);

    return matchesSearch && matchesStatus;
  });

  // Helper to check if subscription is expired
  const isSubscriptionExpired = (service) => {
    return (
      service.subscriptionEndDate &&
      new Date(service.subscriptionEndDate) < new Date()
    );
  };

  // Helper to get days remaining
  const getDaysRemaining = (service) => {
    if (!service.subscriptionEndDate) return null;
    const now = new Date();
    const end = new Date(service.subscriptionEndDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50">
        <AdminHeader />
        <div className="flex h-[calc(100vh-80px)] mt-[80px]">
          <div className="hidden 800px:block w-[80px] 800px:w-[250px] flex-shrink-0 h-full overflow-y-auto">
            <AdminSideBar active={16} />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdminHeader />
      <div className="flex h-[calc(100vh-80px)] mt-[80px]">
        <div className="hidden 800px:block w-[80px] 800px:w-[250px] flex-shrink-0 h-full overflow-y-auto">
          <AdminSideBar active={16} />
        </div>
        <div className="flex-1 h-full overflow-y-auto p-4 800px:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Store Manager Subscriptions
            </h1>
            <p className="text-gray-500 mt-1">
              Manage monthly store manager subscriptions across all vendors
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.expired}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.suspended}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiX className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Managers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.withManagers}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.revenue.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by shop name or manager email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
                <option value="with_manager">With Manager</option>
                <option value="without_manager">Without Manager</option>
              </select>

              {/* Assign Free Service Button */}
              <button
                onClick={() => setShowFreeServiceModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FiUsers className="w-4 h-4" />
                <span>Assign Free Service</span>
              </button>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Shop
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Subscription Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned Manager
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Payments
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              {service.shop?.avatar?.url ? (
                                <img
                                  src={service.shop.avatar.url}
                                  alt={service.shop.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <AiOutlineShop className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {service.shop?.name || "Unknown Shop"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {service.shop?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isSubscriptionExpired(service)
                                ? "bg-orange-100 text-orange-800"
                                : service.serviceStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : service.serviceStatus === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {isSubscriptionExpired(service)
                              ? "Expired"
                              : service.serviceStatus.charAt(0).toUpperCase() +
                                service.serviceStatus.slice(1)}
                          </span>
                          {!isSubscriptionExpired(service) &&
                            getDaysRemaining(service) !== null &&
                            getDaysRemaining(service) <= 7 && (
                              <span className="block text-xs text-orange-600 mt-1">
                                {getDaysRemaining(service)} days left
                              </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          {service.serviceStatus === "suspended" ? (
                            <div className="text-sm">
                              <span className="text-red-500 font-medium">
                                Service Suspended
                              </span>
                              {service.suspendedAt && (
                                <div className="flex items-center text-gray-400 mt-1">
                                  <FiClock className="w-3.5 h-3.5 mr-1" />
                                  <span>
                                    Since{" "}
                                    {new Date(
                                      service.suspendedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : service.subscriptionStartDate ? (
                            <div className="text-sm">
                              <div className="flex items-center text-gray-500">
                                <FiCalendar className="w-3.5 h-3.5 mr-1" />
                                <span>
                                  {new Date(
                                    service.subscriptionStartDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div
                                className={`flex items-center mt-1 ${
                                  isSubscriptionExpired(service)
                                    ? "text-orange-600"
                                    : "text-gray-500"
                                }`}
                              >
                                <FiClock className="w-3.5 h-3.5 mr-1" />
                                <span>
                                  {service.subscriptionEndDate
                                    ? new Date(
                                        service.subscriptionEndDate
                                      ).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {service.assignedManager ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {service.assignedManager.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {service.assignedManager.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              $
                              {service.paymentHistory?.length > 0
                                ? service.paymentHistory
                                    .reduce(
                                      (sum, p) => sum + (p.amount || 0),
                                      0
                                    )
                                    .toFixed(2)
                                : service.purchaseInfo?.amount?.toFixed(2) ||
                                  "0.00"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.paymentHistory?.length > 0
                                ? `${service.paymentHistory.length} payment(s)`
                                : service.purchaseInfo?.paymentMethod ===
                                  "admin_granted"
                                ? "Admin Granted"
                                : service.purchaseInfo?.paymentMethod ||
                                  "PayPal"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Only show suspend/restore for active or suspended services */}
                            {(service.serviceStatus === "active" ||
                              service.serviceStatus === "suspended") &&
                              !isSubscriptionExpired(service) && (
                                <button
                                  onClick={() =>
                                    handleToggleSuspension(
                                      service._id,
                                      service.serviceStatus
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    service.serviceStatus === "active"
                                      ? "text-red-600 hover:bg-red-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                  title={
                                    service.serviceStatus === "active"
                                      ? "Suspend"
                                      : "Restore"
                                  }
                                >
                                  {service.serviceStatus === "active" ? (
                                    <FiX className="w-5 h-5" />
                                  ) : (
                                    <FiCheck className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            {/* For expired subscriptions, show expired indicator */}
                            {isSubscriptionExpired(service) && (
                              <span className="text-xs text-orange-500 italic">
                                Subscription expired
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FiAlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500">
                            No store manager services found
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Free Service Modal */}
          {showFreeServiceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assign Free Store Manager Subscription
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select a shop and subscription duration to grant free Store
                  Manager service.
                </p>

                <select
                  value={selectedShopForFree}
                  onChange={(e) => setSelectedShopForFree(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  <option value="">Select a shop...</option>
                  {allShops
                    .filter(
                      (shop) => !services.find((s) => s.shop?._id === shop._id)
                    )
                    .map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.name} ({shop.email})
                      </option>
                    ))}
                </select>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Duration
                  </label>
                  <select
                    value={freeServiceDuration}
                    onChange={(e) =>
                      setFreeServiceDuration(Number(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowFreeServiceModal(false);
                      setSelectedShopForFree("");
                      setFreeServiceDuration(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignFreeService}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Assign Free Service
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStoreManagerPage;
