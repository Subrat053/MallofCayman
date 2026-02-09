import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  FiUserPlus,
  FiUsers,
  FiSearch,
  FiCheck,
  FiX,
  FiShield,
  FiPackage,
  FiShoppingBag,
  FiSettings,
  FiDollarSign,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiUser,
  FiCreditCard,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPlusCircle,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PAYPAL_CLIENT_ID =
  "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA";

const VendorStoreManager = () => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasService, setHasService] = useState(false);
  const [price, setPrice] = useState(100);

  // Subscription status
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canRenew, setCanRenew] = useState(false);
  const [isRenewal, setIsRenewal] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Purchase flow
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Search & assign
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Create new manager account
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creatingManager, setCreatingManager] = useState(false);

  // Remove manager
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);

  // Fetch service status
  useEffect(() => {
    fetchServiceStatus();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!service?.subscriptionEndDate || isExpired) return;

    const calculateCountdown = () => {
      const endDate = new Date(service.subscriptionEndDate);
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [service?.subscriptionEndDate, isExpired]);

  const fetchServiceStatus = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/store-manager/my-service`, {
        withCredentials: true,
      });
      setService(data.service);
      setHasService(data.hasService);
      setIsExpired(data.isExpired || false);
      setDaysRemaining(data.daysRemaining || 0);
      setCanRenew(data.canRenew || false);
      setPrice(data.price || 100);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to load Store Manager service info");
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = useCallback(async (email) => {
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data } = await axios.get(
        `${server}/store-manager/search-users?email=${encodeURIComponent(
          email
        )}`,
        { withCredentials: true }
      );
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchEmail) {
        searchUsers(searchEmail);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchEmail, searchUsers]);

  // Create PayPal order
  const createOrder = async () => {
    try {
      const { data } = await axios.post(
        `${server}/store-manager/create-purchase`,
        { isRenewal },
        { withCredentials: true }
      );
      return data.orderId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
      throw error;
    }
  };

  // Capture PayPal payment
  const onApprove = async (data) => {
    try {
      setProcessingPayment(true);
      await axios.post(
        `${server}/store-manager/activate-service`,
        { orderId: data.orderID, isRenewal },
        { withCredentials: true }
      );
      toast.success(
        isRenewal
          ? "Store Manager subscription renewed successfully!"
          : "Store Manager service activated successfully!"
      );
      setShowPayment(false);
      setIsRenewal(false);
      fetchServiceStatus();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to activate service";
      const errorCode = error.response?.data?.errorCode || "PAYMENT_FAILED";

      // Show specific toast based on error type
      if (errorCode === "INSUFFICIENT_FUNDS") {
        toast.warning(errorMessage, { autoClose: 8000 });
      } else if (errorCode === "PAYMENT_DECLINED") {
        toast.error(errorMessage, { autoClose: 8000 });
      } else if (errorCode === "CARD_EXPIRED") {
        toast.error(errorMessage, { autoClose: 8000 });
      } else if (errorCode === "NOT_APPROVED") {
        toast.warning(errorMessage, { autoClose: 8000 });
      } else {
        toast.error(errorMessage, { autoClose: 6000 });
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  // Start renewal flow
  const handleRenew = () => {
    setIsRenewal(true);
    setShowPayment(true);
  };

  // Handle PayPal error
  const onError = (err) => {
    console.error("PayPal error:", err);
    toast.error("Payment could not be processed. Please try again.", {
      autoClose: 6000,
    });
    setProcessingPayment(false);
  };

  // Handle PayPal cancel
  const onCancel = () => {
    toast.info("Payment was cancelled. You can try again anytime.");
    setProcessingPayment(false);
  };

  // Assign manager
  const assignManager = async (userId) => {
    try {
      setAssigning(true);
      await axios.post(
        `${server}/store-manager/assign-manager`,
        { userId },
        { withCredentials: true }
      );
      toast.success("Store Manager assigned successfully!");
      setSearchEmail("");
      setSearchResults([]);
      fetchServiceStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign manager");
    } finally {
      setAssigning(false);
    }
  };

  // Create new manager account
  const handleCreateManager = async (e) => {
    e.preventDefault();

    if (
      !createFormData.name ||
      !createFormData.email ||
      !createFormData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (createFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setCreatingManager(true);
      await axios.post(
        `${server}/store-manager/create-manager-account`,
        createFormData,
        { withCredentials: true }
      );
      toast.success("Store Manager account created and assigned successfully!");
      setShowCreateForm(false);
      setCreateFormData({ name: "", email: "", password: "", phoneNumber: "" });
      fetchServiceStatus();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create manager account"
      );
    } finally {
      setCreatingManager(false);
    }
  };

  // Remove manager
  const handleRemoveManager = async () => {
    try {
      setRemoving(true);
      await axios.post(
        `${server}/store-manager/remove-manager`,
        { reason: removeReason },
        { withCredentials: true }
      );
      toast.success("Store Manager removed successfully");
      setShowRemoveModal(false);
      setRemoveReason("");
      fetchServiceStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove manager");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FiUsers className="text-3xl" />
          <h1 className="text-2xl font-bold">Store Manager Service</h1>
        </div>
        <p className="text-blue-100">
          Delegate day-to-day store operations to a trusted Store Manager while
          retaining full control of your business.
        </p>
      </div>

      {/* Service Not Purchased */}
      {!hasService && !isExpired && !showPayment && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Pricing Card */}
          <div className="p-8 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <FiUserPlus className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Store Manager Service
            </h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              <span className="text-4xl font-bold text-blue-600">${price}</span>
              <span className="text-gray-500">/ month</span>
            </div>
            <p className="text-gray-600 max-w-lg mx-auto">
              Subscribe to this service to assign a Store Manager who can help
              manage your products, inventory, and order fulfillment.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <FiAlertCircle />
              Monthly subscription - renew each month
            </div>
          </div>

          {/* Features */}
          <div className="p-6 grid md:grid-cols-2 gap-4">
            {/* What Manager Can Do */}
            <div className="bg-green-50 rounded-xl p-5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <FiCheck className="text-green-600" />
                Store Manager CAN:
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <FiPackage className="shrink-0" /> Add and edit products
                </li>
                <li className="flex items-center gap-2">
                  <FiPackage className="shrink-0" /> Upload product images
                </li>
                <li className="flex items-center gap-2">
                  <FiPackage className="shrink-0" /> Update prices & stock
                  levels
                </li>
                <li className="flex items-center gap-2">
                  <FiShoppingBag className="shrink-0" /> View and manage orders
                </li>
                <li className="flex items-center gap-2">
                  <FiShoppingBag className="shrink-0" /> Update order
                  fulfillment
                </li>
              </ul>
            </div>

            {/* What Manager Cannot Do */}
            <div className="bg-red-50 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <FiX className="text-red-600" />
                Store Manager CANNOT:
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center gap-2">
                  <FiSettings className="shrink-0" /> Edit store settings/info
                </li>
                <li className="flex items-center gap-2">
                  <FiDollarSign className="shrink-0" /> Access payment settings
                </li>
                <li className="flex items-center gap-2">
                  <FiDollarSign className="shrink-0" /> Issue refunds
                </li>
                <li className="flex items-center gap-2">
                  <FiShield className="shrink-0" /> Change owner details
                </li>
                <li className="flex items-center gap-2">
                  <FiShield className="shrink-0" /> Change account settings
                </li>
              </ul>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => {
                setIsRenewal(false);
                setShowPayment(true);
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <FiCreditCard className="text-xl" />
              Subscribe Now - ${price}/month
            </button>
          </div>
        </div>
      )}

      {/* Payment Flow */}
      {((!hasService && !isExpired) || isRenewal) && showPayment && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isRenewal ? "Renew Subscription" : "Complete Payment"}
            </h2>
            <button
              onClick={() => {
                setShowPayment(false);
                setIsRenewal(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Store Manager Service</span>
              <span className="font-bold text-blue-600">${price}</span>
            </div>
          </div>

          {processingPayment ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <PayPalScriptProvider
              options={{
                "client-id": PAYPAL_CLIENT_ID,
                currency: "USD",
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={onCancel}
              />
            </PayPalScriptProvider>
          )}
        </div>
      )}

      {/* Subscription Expired - Show Renewal Option */}
      {isExpired && !showPayment && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-200 p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Subscription Expired
            </h2>
            <p className="text-gray-600">
              Your Store Manager subscription has expired. Renew to continue
              using the service.
            </p>
            {service?.subscriptionEndDate && (
              <p className="text-sm text-gray-500 mt-2">
                Expired on:{" "}
                {new Date(service.subscriptionEndDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Monthly Subscription</span>
              <span className="text-2xl font-bold text-gray-900">
                ${price}/month
              </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-500" /> Assign a Store Manager
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-500" /> Product & Inventory
                Management
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-500" /> Order Fulfillment Access
              </li>
            </ul>
          </div>

          <button
            onClick={handleRenew}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
          >
            <FiCreditCard className="text-xl" />
            Renew Subscription - ${price}
          </button>
        </div>
      )}

      {/* Service Active - Manager Assignment */}
      {hasService && (
        <div className="space-y-6">
          {/* Service Status with Subscription Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Subscription Status
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            {/* Subscription Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {service?.subscriptionStartDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Started</p>
                  <p className="font-medium text-gray-800">
                    {new Date(
                      service.subscriptionStartDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {service?.subscriptionEndDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Expires</p>
                  <p className="font-medium text-gray-800">
                    {new Date(service.subscriptionEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Countdown Timer */}
            {service?.subscriptionEndDate && !isExpired && (
              <div
                className={`rounded-xl p-4 mb-4 ${
                  daysRemaining <= 7
                    ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-3 ${
                    daysRemaining <= 7 ? "text-orange-700" : "text-blue-700"
                  }`}
                >
                  ⏱️ Subscription Ends In
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div
                    className={`text-center rounded-lg p-2 ${
                      daysRemaining <= 7 ? "bg-orange-100" : "bg-blue-100"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        daysRemaining <= 7 ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {countdown.days}
                    </p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                  <div
                    className={`text-center rounded-lg p-2 ${
                      daysRemaining <= 7 ? "bg-orange-100" : "bg-blue-100"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        daysRemaining <= 7 ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {String(countdown.hours).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500">Hours</p>
                  </div>
                  <div
                    className={`text-center rounded-lg p-2 ${
                      daysRemaining <= 7 ? "bg-orange-100" : "bg-blue-100"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        daysRemaining <= 7 ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {String(countdown.minutes).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500">Minutes</p>
                  </div>
                  <div
                    className={`text-center rounded-lg p-2 ${
                      daysRemaining <= 7 ? "bg-orange-100" : "bg-blue-100"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        daysRemaining <= 7 ? "text-orange-600" : "text-blue-600"
                      }`}
                    >
                      {String(countdown.seconds).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500">Seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Renewal Warning */}
            {canRenew && daysRemaining > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-orange-500 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-orange-800 font-medium">
                      Subscription expiring soon!
                    </p>
                    <p className="text-orange-600 text-sm">
                      Your subscription will expire in {daysRemaining} days.
                      Renew now to avoid service interruption.
                    </p>
                  </div>
                  <button
                    onClick={handleRenew}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Renew Now
                  </button>
                </div>
              </div>
            )}

            {service?.purchaseInfo && (
              <div className="text-sm text-gray-500">
                Last payment: ${service.purchaseInfo.amount} via{" "}
                {service.purchaseInfo.paymentMethod === "admin_assigned"
                  ? "Admin"
                  : "PayPal"}{" "}
                on{" "}
                {new Date(
                  service.purchaseInfo.purchaseDate
                ).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Current Manager */}
          {service?.assignedManager ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Current Store Manager
              </h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {service.assignedManager.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {service.assignedManager.name}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <FiMail className="shrink-0" />
                    {service.assignedManager.email}
                  </p>
                  {service.assignedManager.phoneNumber && (
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FiPhone className="shrink-0" />
                      {service.assignedManager.phoneNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowRemoveModal(true)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>

              {service?.managerAssignment?.assignedAt && (
                <p className="text-sm text-gray-500 mt-3">
                  Assigned on:{" "}
                  {new Date(
                    service.managerAssignment.assignedAt
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            /* Search and Assign OR Create New Account */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Assign a Store Manager
              </h2>

              {/* Tab Selection */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    !showCreateForm
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiSearch className="text-lg" />
                  Search Existing User
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    showCreateForm
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiPlusCircle className="text-lg" />
                  Create New Account
                </button>
              </div>

              {/* Search Existing User */}
              {!showCreateForm && (
                <>
                  <div className="mb-4">
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Search by user email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {searching && (
                        <AiOutlineLoading3Quarters className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      The user must have a Mall of Cayman account. Enter at
                      least 3 characters to search.
                    </p>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {user.name}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {user.email}
                            </p>
                          </div>
                          <button
                            onClick={() => assignManager(user._id)}
                            disabled={assigning}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {assigning ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              <FiUserPlus />
                            )}
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchEmail.length >= 3 &&
                    !searching &&
                    searchResults.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <FiUser className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No users found with this email</p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="mt-3 text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                        >
                          <FiPlusCircle /> Create a new account instead
                        </button>
                      </div>
                    )}
                </>
              )}

              {/* Create New Manager Account Form */}
              {showCreateForm && (
                <form onSubmit={handleCreateManager} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-green-700">
                      <FiCheck className="inline mr-1" />
                      Create a new account for your Store Manager. Login
                      credentials will be sent to their email.
                    </p>
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter manager's full name"
                        value={createFormData.name}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter manager's email"
                        value={createFormData.email}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        value={createFormData.password}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This password will be sent to the manager's email
                    </p>
                  </div>

                  {/* Phone Number Field (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={createFormData.phoneNumber}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={creatingManager}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {creatingManager ? (
                      <>
                        <AiOutlineLoading3Quarters className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FiUserPlus />
                        Create Store Manager Account
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <FiAlertCircle />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• Payments always go directly to you (the Store Owner)</li>
              <li>
                • Your Store Manager will receive order notifications via email
              </li>
              <li>
                • Store Manager must confirm with you before fulfilling orders
              </li>
              <li>• You can change or remove the Store Manager at any time</li>
              <li>• Only one Store Manager can be assigned per store</li>
            </ul>
          </div>
        </div>
      )}

      {/* Remove Manager Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Remove Store Manager
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove{" "}
              <strong>{service?.assignedManager?.name}</strong> as your Store
              Manager? They will no longer have access to manage your store.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="Enter a reason..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setRemoveReason("");
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveManager}
                disabled={removing}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removing ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : null}
                Remove Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorStoreManager;
