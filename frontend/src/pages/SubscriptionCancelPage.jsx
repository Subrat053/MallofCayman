import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HiXCircle } from "react-icons/hi";

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up the pending subscription ID since user cancelled
    localStorage.removeItem("pendingSubscriptionId");

    toast.info("Subscription payment was cancelled");

    // Redirect after a short delay
    const timer = setTimeout(() => {
      navigate("/dashboard-subscription");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <HiXCircle className="text-6xl text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mb-4">
          Your subscription payment was cancelled. You can try again anytime.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to subscription plans...
        </p>
        <button
          onClick={() => navigate("/dashboard-subscription")}
          className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Back to Subscription Plans
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;
