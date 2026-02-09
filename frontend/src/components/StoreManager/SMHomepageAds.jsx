import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { DataGrid } from "@material-ui/data-grid";
import {
  AiOutlineEye,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineDollar,
} from "react-icons/ai";

import { HiOutlineSpeakerphone, HiOutlineExternalLink } from "react-icons/hi";
import { Button } from "@material-ui/core";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";

const SMHomepageAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopAdStatus, setShopAdStatus] = useState(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchAdvertisements();
    fetchShopAdStatus();
  }, []);

  const fetchShopAdStatus = async () => {
    try {
      const { data } = await axios.get(
        `${server}/store-manager-advertisement/shop-ad-fee-status`,
        { withCredentials: true },
      );
      if (data.success) {
        setShopAdStatus(data.shop);
      }
    } catch (error) {
      console.error("Error fetching shop ad status:", error);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/my-ads`,
        { withCredentials: true },
      );

      if (data.success) {
        setAds(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async (id, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${server}/advertisement/vendor/auto-renew/${id}`,
        { autoRenew: !currentStatus },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update auto-renew",
      );
    }
  };

  const handleCancelAd = async (id) => {
    if (
      !window.confirm("Are you sure you want to cancel this advertisement?")
    ) {
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/advertisement/vendor/cancel/${id}`,
        {},
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Advertisement cancelled successfully");
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel advertisement",
      );
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
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "awaiting_payment":
        return "💳 AWAITING PAYMENT";
      case "pending":
        return "⏳ PENDING APPROVAL";
      case "active":
        return "✓ ACTIVE";
      case "expired":
        return "EXPIRED";
      case "cancelled":
        return "CANCELLED";
      case "rejected":
        return "REJECTED";
      default:
        return status?.toUpperCase();
    }
  };

  const getAdTypeLabel = (type) => {
    const labels = {
      leaderboard: "Leaderboard (728×120)",
      top_sidebar: "Top Sidebar (200×120)",
      right_sidebar_top: "Right Sidebar Top (300×200)",
      right_sidebar_middle: "Right Sidebar Middle (300×200)",
      right_sidebar_bottom: "Right Sidebar Bottom (300×200)",
      featured_store: "Featured Store",
      featured_product: "Featured Product",
      newsletter_inclusion: "Newsletter Inclusion",
      editorial_writeup: "Editorial Write-up",
    };
    return labels[type] || type;
  };

  const columns = [
    {
      field: "title",
      headerName: "Advertisement",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          {params.row.image?.url && (
            <img
              src={params.row.image.url}
              alt={params.row.title}
              className="w-12 h-8 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium text-gray-900 truncate">
              {params.row.title}
            </div>
            <div className="text-xs text-gray-500">
              {getAdTypeLabel(params.row.adType)}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "slotNumber",
      headerName: "Slot",
      minWidth: 80,
      flex: 0.3,
      renderCell: (params) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
          #{params.row.slotNumber || "N/A"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.5,
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(params.row.status)}`}
        >
          {getStatusLabel(params.row.status)}
        </span>
      ),
    },
    {
      field: "totalPrice",
      headerName: "Price",
      minWidth: 100,
      flex: 0.3,
      renderCell: (params) => (
        <span
          className={`font-medium ${params.row.totalPrice === 0 ? "text-green-600" : "text-gray-900"}`}
        >
          {params.row.totalPrice === 0
            ? "FREE"
            : formatPrice(params.row.totalPrice)}
        </span>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      minWidth: 120,
      flex: 0.4,
      renderCell: (params) => (
        <div className="text-sm">
          <div>{params.row.duration} month(s)</div>
          <div className="text-xs text-gray-500">
            Ends: {new Date(params.row.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      field: "stats",
      headerName: "Stats",
      minWidth: 100,
      flex: 0.3,
      renderCell: (params) => (
        <div className="text-xs">
          <div>👁 {params.row.views || 0}</div>
          <div>👆 {params.row.clicks || 0}</div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 0.6,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          {params.row.status === "awaiting_payment" && (
            <Button
              onClick={() =>
                navigate(
                  `/store-manager/homepage-ads/payment/${params.row._id}`,
                )
              }
              className="!bg-green-500 !text-white !min-w-0 !px-3"
              size="small"
            >
              <AiOutlineDollar className="mr-1" /> Pay
            </Button>
          )}
          <Button
            onClick={() =>
              navigate(
                `/store-manager/homepage-ads/analytics/${params.row._id}`,
              )
            }
            className="!bg-blue-500 !text-white !min-w-0 !px-2"
            size="small"
          >
            <AiOutlineEye />
          </Button>
          {["active", "pending"].includes(params.row.status) && (
            <Button
              onClick={() => handleCancelAd(params.row._id)}
              className="!bg-red-500 !text-white !min-w-0 !px-2"
              size="small"
            >
              <AiOutlineDelete />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows = ads.map((ad) => ({
    id: ad._id,
    ...ad,
  }));

  return (
    <div className="w-full mx-2 sm:mx-4 800px:mx-8 pt-1 mt-4 sm:mt-10 bg-white rounded-lg shadow-md">
      {/* Shop Exemption Banner */}
      {shopAdStatus?.adFeeExempt && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            {shopAdStatus.isInHouseStore ? (
              <span className="font-medium">🏪 IN-HOUSE STORE</span>
            ) : (
              <span className="font-medium">✨ VIP PARTNER</span>
            )}
            <span className="text-purple-200 ml-2">|</span>
            <span className="text-purple-100 text-sm">
              Your store is exempt from advertising fees - All homepage ads are
              FREE!
              {shopAdStatus.adFeeExemptReason &&
                ` (${shopAdStatus.adFeeExemptReason})`}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <HiOutlineSpeakerphone className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Homepage Advertisements
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Ads displayed on the main website homepage
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/store-manager/homepage-ads/pricing"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 font-semibold text-sm transition-colors"
            >
              <HiOutlineExternalLink size={16} />
              View Pricing
            </Link>
            <Link
              to="/store-manager/homepage-ads/create"
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 font-semibold text-sm transition-colors"
            >
              <AiOutlinePlus size={18} />
              Create Ad
            </Link>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center gap-2 text-blue-800">
          <span className="text-lg">ℹ️</span>
          <p className="text-sm">
            <strong>Homepage ads</strong> are displayed on the main website to
            all visitors. They appear in designated slots (leaderboard, sidebar)
            and rotate every 10 seconds.
            {shopAdStatus?.adFeeExempt
              ? " Your ads are FREE and auto-approved!"
              : " Payment and admin approval required."}
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 border-b">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border-l-4 border-orange-500">
          <div className="text-xs text-gray-600">Total Ads</div>
          <div className="text-2xl font-bold text-orange-600">{ads.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border-l-4 border-green-500">
          <div className="text-xs text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {ads.filter((ad) => ad.status === "active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
          <div className="text-xs text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {
              ads.filter(
                (ad) =>
                  ad.status === "pending" || ad.status === "awaiting_payment",
              ).length
            }
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
          <div className="text-xs text-gray-600">Total Views</div>
          <div className="text-2xl font-bold text-blue-600">
            {ads.reduce((sum, ad) => sum + (ad.views || 0), 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border-l-4 border-purple-500">
          <div className="text-xs text-gray-600">Total Clicks</div>
          <div className="text-2xl font-bold text-purple-600">
            {ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineSpeakerphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Homepage Ads Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first homepage advertisement to reach thousands of
              customers!
            </p>
            <Link
              to="/store-manager/homepage-ads/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
            >
              <AiOutlinePlus size={20} />
              Create Your First Ad
            </Link>
          </div>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
            className="!border-0"
          />
        )}
      </div>
    </div>
  );
};

export default SMHomepageAds;
