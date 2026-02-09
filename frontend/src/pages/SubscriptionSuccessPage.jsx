import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import { HiCheckCircle, HiXCircle, HiExclamationCircle } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activating, setActivating] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  // Get user-friendly error title based on error code
  const getErrorTitle = (code) => {
    switch (code) {
      case "PAYMENT_DECLINED":
        return "Payment Declined";
      case "INSUFFICIENT_FUNDS":
        return "Insufficient Funds";
      case "CARD_EXPIRED":
        return "Card Expired";
      case "NOT_APPROVED":
        return "Payment Not Approved";
      case "ACTION_REQUIRED":
        return "Action Required";
      case "ALREADY_CAPTURED":
        return "Already Processed";
      default:
        return "Payment Failed";
    }
  };

  // Get icon based on error code
  const getErrorIcon = (code) => {
    if (code === "INSUFFICIENT_FUNDS" || code === "CARD_EXPIRED") {
      return (
        <HiExclamationCircle className="text-6xl text-orange-500 mx-auto mb-4" />
      );
    }
    return <HiXCircle className="text-6xl text-red-500 mx-auto mb-4" />;
  };

  useEffect(() => {
    const activateSubscription = async () => {
      const token = searchParams.get("token");
      const subscriptionId = localStorage.getItem("pendingSubscriptionId");

      if (!token || !subscriptionId) {
        setErrorMessage(
          "Invalid payment session. Please try subscribing again."
        );
        setErrorCode("INVALID_SESSION");
        setActivating(false);
        toast.error("Invalid payment session");
        return;
      }

      try {
        const { data } = await axios.post(
          `${server}/subscription/activate-subscription`,
          { orderId: token, subscriptionId },
          { withCredentials: true }
        );

        if (data.success) {
          setSuccess(true);
          localStorage.removeItem("pendingSubscriptionId");
          toast.success("Subscription activated successfully!");

          setTimeout(() => {
            navigate("/dashboard-subscription");
          }, 3000);
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Failed to activate subscription. Please try again.";
        const code = error.response?.data?.errorCode || "PAYMENT_FAILED";

        setErrorMessage(message);
        setErrorCode(code);
        localStorage.removeItem("pendingSubscriptionId");

        // Show specific toast based on error type
        if (code === "INSUFFICIENT_FUNDS") {
          toast.warning("Payment failed due to insufficient funds");
        } else if (code === "PAYMENT_DECLINED") {
          toast.error("Your payment method was declined");
        } else if (code === "CARD_EXPIRED") {
          toast.error("Your card has expired");
        } else {
          toast.error(message);
        }
      } finally {
        setActivating(false);
      }
    };

    activateSubscription();
  }, [searchParams, navigate]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        success
          ? "bg-gradient-to-br from-green-50 to-blue-50"
          : activating
          ? "bg-gradient-to-br from-blue-50 to-indigo-50"
          : "bg-gradient-to-br from-red-50 to-orange-50"
      }`}
    >
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        {activating ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activating Your Subscription
            </h2>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
          </>
        ) : success ? (
          <>
            <HiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Activated!
            </h2>
            <p className="text-gray-600 mb-4">
              Your subscription has been successfully activated.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            {getErrorIcon(errorCode)}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getErrorTitle(errorCode)}
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>

            {/* Helpful suggestions based on error */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">
                What you can do:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {errorCode === "INSUFFICIENT_FUNDS" && (
                  <>
                    <li>• Add funds to your PayPal account</li>
                    <li>• Link a different bank account or card</li>
                    <li>• Try a different payment method</li>
                  </>
                )}
                {errorCode === "PAYMENT_DECLINED" && (
                  <>
                    <li>• Check your card details are correct</li>
                    <li>• Contact your bank to authorize the payment</li>
                    <li>• Try a different card or payment method</li>
                  </>
                )}
                {errorCode === "CARD_EXPIRED" && (
                  <>
                    <li>• Update your card in PayPal</li>
                    <li>• Add a new valid card</li>
                    <li>• Use PayPal balance instead</li>
                  </>
                )}
                {errorCode === "NOT_APPROVED" && (
                  <>
                    <li>• Complete the payment approval on PayPal</li>
                    <li>• Make sure to click "Pay Now" on PayPal</li>
                    <li>• Try the subscription process again</li>
                  </>
                )}
                {![
                  "INSUFFICIENT_FUNDS",
                  "PAYMENT_DECLINED",
                  "CARD_EXPIRED",
                  "NOT_APPROVED",
                ].includes(errorCode) && (
                  <>
                    <li>• Try subscribing again</li>
                    <li>• Check your PayPal account status</li>
                    <li>• Contact support if the issue persists</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard-subscription")}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
