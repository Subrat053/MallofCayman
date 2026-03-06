import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";

const SubscriptionStripeSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const subscriptionId = searchParams.get("subscriptionId");

    if (!sessionId || !subscriptionId) {
      toast.error("Invalid session parameters");
      navigate("/seller/subscription");
      return;
    }

    const activateSubscription = async () => {
      try {
        const { data } = await axios.post(
          `${server}/subscription/stripe/activate-subscription`,
          { sessionId, subscriptionId },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("Subscription activated successfully!");
          navigate("/dashboard");
        } else {
          throw new Error(data.message || "Activation failed");
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message || error.message || "Failed to activate subscription";
        toast.error(msg);
        navigate("/seller/subscription");
      }
    };

    activateSubscription();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Activating your subscription...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStripeSuccessPage;
