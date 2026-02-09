import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  AiOutlineArrowLeft,
  AiOutlineEye,
  AiOutlineLink,
} from "react-icons/ai";
import { BsCursorFill } from "react-icons/bs";
import { HiOutlineChartBar } from "react-icons/hi";
import { useCurrency } from "../../context/CurrencyContext";

const SMHomepageAdAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [ad, setAd] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/analytics/${id}`,
        { withCredentials: true },
      );

      if (data.success) {
        setAd(data.advertisement);
        setAnalytics(data.analytics);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load analytics");
      navigate("/store-manager/homepage-ads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "awaiting_payment":
        return "bg-orange-100 text-orange-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const ctr =
    analytics?.views > 0
      ? ((analytics.clicks / analytics.views) * 100).toFixed(2)
      : 0;

  return (
    <div className="w-full mx-2 sm:mx-4 md:mx-6 lg:mx-8 pt-1 mt-4 sm:mt-6 md:mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <HiOutlineChartBar className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Ad Analytics
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 mt-1">
                Performance metrics for your advertisement
              </p>
            </div>
          </div>
          <Link
            to="/store-manager/homepage-ads"
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 font-semibold text-sm transition-colors w-fit"
          >
            <AiOutlineArrowLeft size={16} />
            Back to Ads
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Ad Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ad Preview Card */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            {ad.image?.url && (
              <img
                src={ad.image.url}
                alt={ad.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="font-semibold text-gray-800 truncate">{ad.title}</h3>
            <p className="text-sm text-gray-500">{getAdTypeLabel(ad.adType)}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ad.status)}`}
              >
                {ad.status?.toUpperCase()}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                Slot #{ad.slotNumber}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-1">
                <AiOutlineEye className="text-blue-600" />
                <span className="text-xs text-gray-600">Views</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {analytics?.views?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-1">
                <BsCursorFill className="text-green-600" />
                <span className="text-xs text-gray-600">Clicks</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {analytics?.clicks?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-1">
                <AiOutlineLink className="text-purple-600" />
                <span className="text-xs text-gray-600">CTR</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{ctr}%</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-600">Cost</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(ad.totalPrice || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Details */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Ad Details
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{ad.duration} month(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold">
                  {new Date(ad.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date</span>
                <span className="font-semibold">
                  {new Date(ad.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-Renew</span>
                <span
                  className={`font-semibold ${ad.autoRenew ? "text-green-600" : "text-gray-500"}`}
                >
                  {ad.autoRenew ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`font-semibold ${ad.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}
                >
                  {ad.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">
              💡 Performance Tips
            </h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  A good CTR is typically above 0.5%. Your current CTR is {ctr}
                  %.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Use high-quality images that grab attention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Include a clear call-to-action in your ad design.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Link to specific products for better conversions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Rotate your ads periodically to avoid ad fatigue.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Days Remaining */}
        {ad.status === "active" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">Days Remaining</h4>
                <p className="text-sm text-blue-600">
                  Your ad will expire on{" "}
                  {new Date(ad.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(ad.endDate) - new Date()) / (1000 * 60 * 60 * 24),
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMHomepageAdAnalytics;
