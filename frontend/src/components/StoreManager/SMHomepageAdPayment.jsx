import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineDollar, AiOutlineCheck } from "react-icons/ai";

import { useCurrency } from "../../context/CurrencyContext";

const SMHomepageAdPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  useEffect(() => {
    fetchAdvertisement();
  }, [id]);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/ad/${id}`,
        { withCredentials: true },
      );

      if (data.success) {
        setAd(data.advertisement);

        // If already paid, redirect
        if (data.advertisement.paymentStatus === "paid") {
          toast.info("This advertisement has already been paid for.");
          navigate("/store-manager/homepage-ads");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load advertisement",
      );
      navigate("/store-manager/homepage-ads");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const { data } = await axios.post(
        `${server}/advertisement/process-payment`,
        {
          advertisementId: id,
          paymentMethod,
        },
        { withCredentials: true },
      );

      if (data.success) {
        if (data.approvalUrl) {
          // Redirect to PayPal for payment
          window.location.href = data.approvalUrl;
        } else {
          // Payment completed (free ad or other method)
          toast.success("Payment processed successfully!");
          navigate("/store-manager/homepage-ads");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const getAdTypeLabel = (type) => {
    const labels = {
      leaderboard: "Leaderboard (728×120)",
      top_sidebar: "Top Sidebar (200×120)",
      right_sidebar_top: "Right Sidebar Top (300×200)",
      right_sidebar_middle: "Right Sidebar Middle (300×200)",
      right_sidebar_bottom: "Right Sidebar Bottom (300×200)",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">Advertisement not found</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-2 sm:mx-4 md:mx-6 lg:mx-8 pt-1 mt-4 sm:mt-6 md:mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex items-center gap-3">
          <AiOutlineDollar className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Complete Payment
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 mt-1">
              Finalize your homepage advertisement
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Advertisement Details
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 border">
              {ad.image?.url && (
                <img
                  src={ad.image.url}
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Title</span>
                  <p className="font-semibold text-gray-800">{ad.title}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Type</span>
                  <p className="text-gray-700">{getAdTypeLabel(ad.adType)}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Slot</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    #{ad.slotNumber}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Duration</span>
                  <p className="text-gray-700">{ad.duration} month(s)</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Period</span>
                  <p className="text-gray-700">
                    {new Date(ad.startDate).toLocaleDateString()} -{" "}
                    {new Date(ad.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Summary
            </h3>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 border-orange-300">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">
                    {formatPrice(ad.pricing?.basePrice || 0)}/month
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{ad.duration} month(s)</span>
                </div>

                {ad.pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({ad.pricing.discount}%)</span>
                    <span className="font-semibold">
                      -{formatPrice(ad.pricing.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-orange-300 pt-3">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-orange-600">
                      {formatPrice(ad.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Method
                </label>

                <div className="space-y-2">
                  <label
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 flex items-center gap-2">
                      <img
                        src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                        alt="PayPal"
                        className="h-6"
                      />
                      <span className="font-medium">PayPal</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <AiOutlineCheck size={20} />
                    Pay {formatPrice(ad.totalPrice)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Secure payment processed by PayPal. Your ad will go for admin
                review after payment.
              </p>
            </div>

            {/* Cancel Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/store-manager/homepage-ads")}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMHomepageAdPayment;
