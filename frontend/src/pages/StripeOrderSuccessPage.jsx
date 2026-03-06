import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useSelector } from "react-redux";

const StripeOrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      toast.error("Payment session not found.");
      return;
    }
    processOrder(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processOrder = async (sessionId) => {
    try {
      // 1. Verify Stripe Checkout Session
      const { data: verifyData } = await axios.get(
        `${server}/payment/stripe/verify-session/${sessionId}`,
        { withCredentials: true }
      );

      if (!verifyData.isPaid) {
        setStatus("error");
        toast.error("Payment was not completed. Please try again.");
        setTimeout(() => navigate("/payment"), 3000);
        return;
      }

      // 2. Get order data from localStorage
      const orderData = JSON.parse(localStorage.getItem("latestOrder") || "{}");
      if (!orderData.cart || !orderData.cart.length) {
        setStatus("error");
        toast.error("Order data not found. Please contact support.");
        return;
      }

      // 3. Submit order to backend
      const order = {
        cart: orderData.cart,
        shippingAddress: orderData.shippingAddress,
        user,
        totalPrice: orderData.totalPrice,
        subTotalPrice: orderData.subTotalPrice,
        shippingPrice: orderData.shipping,
        discountPrice: orderData.discountPrice,
        tax: orderData.tax || 0,
        deliveryMethod: orderData.deliveryMethod || "COLLECT",
        deliveryDistrict: orderData.deliveryDistrict || null,
        deliveryFeeAmount: orderData.deliveryFeeAmount || 0,
        deliveryProviderType: orderData.deliveryProviderType || "VENDOR",
        pickupDetails: orderData.pickupDetails || null,
        paymentInfo: {
          id: verifyData.paymentIntentId || sessionId,
          status: "succeeded",
          type: "Stripe",
        },
      };

      const { data: orderRes } = await axios.post(
        `${server}/order/create-order`,
        order,
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      localStorage.setItem(
        "latestOrderData",
        JSON.stringify({
          orders: orderRes.orders,
          paymentMethod: "Stripe",
          totalAmount: orderData.totalPrice,
          user,
          timestamp: new Date().toISOString(),
        })
      );
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));

      setStatus("success");
      toast.success("Order placed successfully!");
      navigate("/order/success");
    } catch (error) {
      setStatus("error");
      toast.error(
        error.response?.data?.message ||
          "Failed to process order. Please contact support."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {status === "verifying" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Processing your order...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we confirm your payment.
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl font-bold">✕</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Something went wrong
          </h2>
          <p className="text-gray-500 mt-2">Redirecting you back...</p>
        </div>
      )}
    </div>
  );
};

export default StripeOrderSuccessPage;
