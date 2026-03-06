import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";

const StripeAdPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const advertisementId = searchParams.get("advertisementId");
    const returnPath = searchParams.get("returnPath") || "/dashboard-advertisements";

    if (!sessionId || !advertisementId) {
      setStatus("error");
      toast.error("Missing payment details.");
      return;
    }
    confirmPayment(sessionId, advertisementId, returnPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmPayment = async (sessionId, advertisementId, returnPath) => {
    try {
      const { data } = await axios.post(
        `${server}/advertisement/stripe/confirm-ad-payment`,
        { sessionId, advertisementId },
        { withCredentials: true }
      );

      if (data.success) {
        setStatus("success");
        const msg = data.autoApproved
          ? "Payment successful! Your ad is now LIVE!"
          : "Payment successful! Your ad is pending admin approval.";
        toast.success(msg);

        // Validate return path before using it
        const safeReturn = /^\/[a-zA-Z0-9\-_/]*$/.test(returnPath)
          ? returnPath
          : "/dashboard-advertisements";
        setTimeout(() => navigate(safeReturn), 2000);
      }
    } catch (error) {
      setStatus("error");
      toast.error(
        error.response?.data?.message || "Failed to confirm payment."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {status === "processing" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Confirming your payment...
          </h2>
          <p className="text-gray-500 mt-2">Please wait.</p>
        </div>
      )}
      {status === "success" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Payment Confirmed!
          </h2>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl font-bold">✕</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Confirmation Failed
          </h2>
          <p className="text-gray-500 mt-2">
            Please contact support with your payment receipt.
          </p>
        </div>
      )}
    </div>
  );
};

export default StripeAdPaymentSuccessPage;
