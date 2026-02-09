import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiTruck,
  FiArrowLeft,
  FiLoader,
  FiDownload,
} from "react-icons/fi";
import { BsBagCheck } from "react-icons/bs";

// Helper function to get order number for display
const getOrderNumber = (order) => {
  return (
    order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`
  );
};

const SMOrderDetails = () => {
  const { user } = useSelector((state) => state.user);
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Allowed fulfillment statuses (no refund options for store manager)
  const fulfillmentStatuses = [
    "Processing",
    "Transferred to delivery partner",
    "Shipping",
    "Delivered",
  ];

  // Verify store manager access and fetch order
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get managed shop
        const shopRes = await axios.get(
          `${server}/store-manager/my-managed-shop`,
          { withCredentials: true }
        );

        if (!shopRes.data.success || !shopRes.data.shop) {
          toast.error("You are not assigned as a store manager");
          navigate("/");
          return;
        }

        setShopData(shopRes.data.shop);

        // Fetch order details
        const orderRes = await axios.get(
          `${server}/order/get-order-details/${id}`,
          { withCredentials: true }
        );

        // Verify order belongs to this shop
        const orderData = orderRes.data?.order;
        if (!orderData) {
          toast.error("Order not found");
          navigate("/store-manager/orders");
          return;
        }

        // Check if any item in the order belongs to this shop
        const belongsToShop = orderData.cart?.some(
          (item) => item.shopId === shopRes.data.shop._id
        );

        if (!belongsToShop) {
          toast.error("This order does not belong to your managed store");
          navigate("/store-manager/orders");
          return;
        }

        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Unauthorized access");
          navigate("/");
        } else {
          toast.error("Failed to load order details");
          navigate("/store-manager/orders");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "store_manager") {
      fetchData();
    } else {
      navigate("/");
    }
  }, [user, id, navigate]);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Update order status to "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdatingStatus(true);

      await axios.put(
        `${server}/order/update-order-status/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      setOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);

      const response = await axios.get(
        `${server}/order/seller-invoice-pdf/${id}`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Get status style
  const getStatusStyle = (status) => {
    const styles = {
      Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Transferred to delivery partner":
        "bg-blue-100 text-blue-700 border-blue-200",
      Shipping: "bg-purple-100 text-purple-700 border-purple-200",
      Delivered: "bg-green-100 text-green-700 border-green-200",
      "Processing refund": "bg-orange-100 text-orange-700 border-orange-200",
      "Refund Success": "bg-gray-100 text-gray-700 border-gray-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!order) {
    return (
      <div className="w-full p-6 text-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/store-manager/orders")}
            className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {getOrderNumber(order)}
            </h1>
            <p className="text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {downloadingInvoice ? (
              <FiLoader className="animate-spin" size={18} />
            ) : (
              <FiDownload size={18} />
            )}
            Download Invoice
          </button>
        </div>
      </div>

      {/* Shop Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          Managing order for:{" "}
          <span className="font-semibold">{shopData?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* Status Update - Only for non-refund statuses */}
            {!order.status.includes("refund") &&
              order.status !== "Cancelled" &&
              order.status !== "Delivered" && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Update Fulfillment Status:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fulfillmentStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={
                          updatingStatus ||
                          order.status === status ||
                          fulfillmentStatuses.indexOf(status) <
                            fulfillmentStatuses.indexOf(order.status)
                        }
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          order.status === status
                            ? "bg-blue-500 text-white"
                            : fulfillmentStatuses.indexOf(status) <
                              fulfillmentStatuses.indexOf(order.status)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {updatingStatus ? "..." : status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Refund Notice */}
            {(order.status.includes("refund") ||
              order.status === "Cancelled") && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">
                  <strong>Note:</strong> Refund handling must be done by the
                  store owner. Please contact them if customer requires a
                  refund.
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-blue-500" />
              Order Items
            </h2>

            <div className="space-y-4">
              {order.cart
                ?.filter((item) => item.shopId === shopData?._id)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={item.images?.[0]?.url || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.qty} ×{" "}
                        {formatPrice(item.discountPrice || item.originalPrice)}
                      </p>
                      {item.selectedVariation && (
                        <p className="text-xs text-gray-400 mt-1">
                          Variation: {item.selectedVariation.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(
                          (item.discountPrice || item.originalPrice) * item.qty
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-blue-500" />
              Customer
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiUser className="text-gray-400 mt-1" size={16} />
                <div>
                  <p className="font-medium text-gray-900">
                    {order.user?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiMail className="text-gray-400 mt-1" size={16} />
                <p className="text-gray-600">{order.user?.email || "N/A"}</p>
              </div>

              {order.user?.phoneNumber && (
                <div className="flex items-start gap-3">
                  <FiPhone className="text-gray-400 mt-1" size={16} />
                  <p className="text-gray-600">{order.user.phoneNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTruck className="text-blue-500" />
              Shipping Address
            </h2>

            <div className="flex items-start gap-3">
              <FiMapPin className="text-gray-400 mt-1" size={16} />
              <div className="text-gray-600">
                <p>{order.shippingAddress?.address1}</p>
                {order.shippingAddress?.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-500" />
              Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.subTotalPrice)}
                </span>
              </div>

              {order.discountPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(order.discountPrice)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">
                  {order.shippingCharge > 0
                    ? formatPrice(order.shippingCharge)
                    : "Free"}
                </span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <BsBagCheck
                    className={
                      order.isPaid ? "text-green-500" : "text-yellow-500"
                    }
                  />
                  <span className="text-sm">
                    {order.isPaid ? (
                      <span className="text-green-600">
                        Paid via {order.paymentInfo?.type || "Online"}
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        Payment Pending (
                        {order.paymentInfo?.type === "Cash On Delivery"
                          ? "COD"
                          : "Awaiting"}
                        )
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Manager Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 text-center">
              As Store Manager, you can update fulfillment status. For payment
              issues, refunds, or store configuration, please contact the store
              owner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMOrderDetails;
