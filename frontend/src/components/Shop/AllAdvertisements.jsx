import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { DataGrid } from "@material-ui/data-grid";
import {
  AiOutlineEye,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
} from "react-icons/ai";
import { MdOutlineAutorenew, MdPauseCircleOutline } from "react-icons/md";
import { Button } from "@material-ui/core";
import { toast } from "react-toastify";

const AllAdvertisements = () => {
  const { seller } = useSelector((state) => state.seller);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasAdPreApproval, setHasAdPreApproval] = useState(false);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  // Check if seller has Ad Pre-Approval feature (Gold plan)
  useEffect(() => {
    const checkAdPreApproval = async () => {
      try {
        const { data } = await axios.get(
          `${server}/subscription/my-subscription`,
          {
            withCredentials: true,
          }
        );
        if (data.success && data.subscription?.features?.adPreApproval) {
          setHasAdPreApproval(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkAdPreApproval();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/my-ads`,
        {
          withCredentials: true,
        }
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
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update auto-renew"
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
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Advertisement cancelled successfully");
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel advertisement"
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil(
      (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {params.row.mediaType === "video" && params.row.video?.url ? (
            <div className="relative w-12 h-8 bg-gray-200 rounded overflow-hidden">
              <video
                src={params.row.video.url}
                className="w-12 h-8 object-cover"
                muted
              />
              <span className="absolute bottom-0 right-0 text-[8px] bg-purple-600 text-white px-1 rounded-tl">
                🎬
              </span>
            </div>
          ) : params.row.image?.url ? (
            <img
              src={params.row.image.url}
              alt={params.row.title}
              className="w-12 h-8 object-cover rounded"
            />
          ) : null}
          <span className="font-medium">{params.row.title}</span>
        </div>
      ),
    },
    {
      field: "adType",
      headerName: "Ad Type",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <span className="text-xs">{getAdTypeLabel(params.value)}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 160,
      renderCell: (params) => (
        <div className="flex flex-col">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              params.value
            )}`}
          >
            {getStatusLabel(params.value)}
          </span>
          {params.row.approvalNote?.includes("Auto-approved") &&
            params.value === "active" && (
              <span className="text-[10px] text-amber-600 mt-1 font-medium">
                ⚡ Auto-Approved (Gold)
              </span>
            )}
          {params.value === "rejected" && params.row.rejectionReason && (
            <span
              className="text-[10px] text-red-600 mt-1 truncate max-w-[100px]"
              title={params.row.rejectionReason}
            >
              ⚠️ {params.row.rejectionReason.substring(0, 20)}...
            </span>
          )}
          {params.value === "awaiting_payment" && (
            <Link
              to={`/dashboard-advertisement-payment/${params.row.id}`}
              className="text-[10px] text-blue-600 mt-1 hover:underline"
            >
              → Complete Payment
            </Link>
          )}
        </div>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      minWidth: 80,
      renderCell: (params) => <span>{params.value} months</span>,
    },
    {
      field: "totalPrice",
      headerName: "Price",
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-semibold">${params.value}</span>
      ),
    },
    {
      field: "endDate",
      headerName: "Expires",
      minWidth: 120,
      renderCell: (params) => {
        const daysRemaining = getDaysRemaining(params.value);
        return (
          <div>
            <div className="text-xs">{formatDate(params.value)}</div>
            {params.row.status === "active" && (
              <div
                className={`text-[10px] ${
                  daysRemaining < 7
                    ? "text-red-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {daysRemaining} days left
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "analytics",
      headerName: "Analytics",
      minWidth: 120,
      renderCell: (params) => (
        <div className="text-xs">
          <div>👁️ {params.row.views || 0} views</div>
          <div>🖱️ {params.row.clicks || 0} clicks</div>
          <div className="text-[10px] text-gray-500">
            CTR: {params.row.clickThroughRate?.toFixed(2) || 0}%
          </div>
        </div>
      ),
    },
    {
      field: "autoRenew",
      headerName: "Auto-Renew",
      minWidth: 100,
      renderCell: (params) => (
        <button
          onClick={() => handleToggleAutoRenew(params.row.id, params.value)}
          disabled={
            params.row.status === "cancelled" ||
            params.row.status === "rejected"
          }
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            params.value
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${
            params.row.status === "cancelled" ||
            params.row.status === "rejected"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {params.value ? "✓ ON" : "✗ OFF"}
        </button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {/* Pay Now button - for awaiting_payment status */}
          {params.row.status === "awaiting_payment" && (
            <Link to={`/dashboard-advertisement-payment/${params.row.id}`}>
              <Button
                size="small"
                variant="contained"
                style={{
                  backgroundColor: "#f97316",
                  color: "white",
                  fontSize: "10px",
                }}
                title="Complete Payment"
              >
                💳 Pay Now
              </Button>
            </Link>
          )}

          <Link to={`/shop-dashboard/advertisement/analytics/${params.row.id}`}>
            <Button size="small" color="primary">
              <AiOutlineEye size={18} />
            </Button>
          </Link>

          {/* Edit button - only for pending, rejected or awaiting_payment ads */}
          {(params.row.status === "pending" ||
            params.row.status === "rejected" ||
            params.row.status === "awaiting_payment") && (
            <Link to={`/dashboard-edit-advertisement/${params.row.id}`}>
              <Button
                size="small"
                style={{ color: "#3b82f6" }}
                title="Edit Advertisement"
              >
                <AiOutlineEdit size={18} />
              </Button>
            </Link>
          )}

          {params.row.status === "active" && (
            <Button
              size="small"
              color="secondary"
              onClick={() => handleCancelAd(params.row.id)}
            >
              <MdPauseCircleOutline size={18} />
            </Button>
          )}

          {(params.row.status === "expired" ||
            params.row.status === "cancelled") && (
            <Link to={`/dashboard-renew-advertisement/${params.row.id}`}>
              <Button size="small" style={{ color: "#10b981" }}>
                <MdOutlineAutorenew size={18} />
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  const rows = ads.map((ad) => ({
    id: ad._id,
    title: ad.title,
    adType: ad.adType,
    status: ad.status,
    duration: ad.duration,
    totalPrice: ad.totalPrice,
    endDate: ad.endDate,
    views: ad.views,
    clicks: ad.clicks,
    clickThroughRate: ad.clickThroughRate,
    autoRenew: ad.autoRenew,
    image: ad.image,
    video: ad.video,
    mediaType: ad.mediaType,
    rejectionReason: ad.rejectionReason,
    approvalNote: ad.approvalNote,
  }));

  return (
    <div className="w-full mx-2 sm:mx-4 lg:mx-8 pt-1 mt-4 sm:mt-10 mb-20 lg:mb-0 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Advertisements
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your advertising campaigns and track performance
            </p>
          </div>
          {hasAdPreApproval && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full shadow-md w-fit">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-bold uppercase tracking-wide">
                Auto-Approval Active
              </span>
            </div>
          )}
        </div>
        <Link to="/dashboard-create-advertisement" className="w-full sm:w-auto">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AiOutlinePlus />}
            fullWidth
            className="!text-sm"
          >
            Create Advertisement
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 p-4 sm:p-6 border-b">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            💳 Awaiting Payment
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-700">
            {ads.filter((ad) => ad.status === "awaiting_payment").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            ⏳ Pending Approval
          </div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-700">
            {ads.filter((ad) => ad.status === "pending").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            ✓ Active Ads
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-700">
            {ads.filter((ad) => ad.status === "active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            Total Views
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {ads.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            Total Clicks
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-700">
            {ads
              .reduce((sum, ad) => sum + (ad.clicks || 0), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No advertisements found</p>
            <Link
              to="/dashboard-create-advertisement"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Create your first advertisement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((ad) => (
              <div
                key={ad.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  {ad.mediaType === "video" && ad.video?.url ? (
                    <div className="relative w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <video
                        src={ad.video.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <span className="absolute bottom-0 right-0 text-[8px] bg-purple-600 text-white px-1 rounded-tl">
                        🎬
                      </span>
                    </div>
                  ) : ad.image?.url ? (
                    <img
                      src={ad.image.url}
                      alt={ad.title}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {ad.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getAdTypeLabel(ad.adType)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      ad.status
                    )}`}
                  >
                    {getStatusLabel(ad.status)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      ad.autoRenew
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Auto-Renew: {ad.autoRenew ? "ON" : "OFF"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">
                      {ad.duration} months
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-semibold">${ad.totalPrice}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Views:</span>
                    <span className="ml-1 font-medium">👁️ {ad.views || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clicks:</span>
                    <span className="ml-1 font-medium">
                      🖱️ {ad.clicks || 0}
                    </span>
                  </div>
                </div>

                {ad.status === "active" && (
                  <div className="text-xs text-gray-500 mb-3">
                    Expires: {formatDate(ad.endDate)} (
                    {getDaysRemaining(ad.endDate)} days left)
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  {ad.status === "awaiting_payment" && (
                    <Link
                      to={`/dashboard-advertisement-payment/${ad.id}`}
                      className="flex-1"
                    >
                      <button className="w-full px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded hover:bg-orange-600">
                        💳 Pay Now
                      </button>
                    </Link>
                  )}
                  <Link to={`/shop-dashboard/advertisement/analytics/${ad.id}`}>
                    <button className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200">
                      <AiOutlineEye size={14} className="inline mr-1" /> View
                    </button>
                  </Link>
                  {(ad.status === "pending" ||
                    ad.status === "rejected" ||
                    ad.status === "awaiting_payment") && (
                    <Link to={`/dashboard-edit-advertisement/${ad.id}`}>
                      <button className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200">
                        <AiOutlineEdit size={14} className="inline mr-1" /> Edit
                      </button>
                    </Link>
                  )}
                  {ad.status === "active" && (
                    <button
                      onClick={() => handleCancelAd(ad.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200"
                    >
                      <MdPauseCircleOutline size={14} className="inline mr-1" />{" "}
                      Cancel
                    </button>
                  )}
                  {(ad.status === "expired" || ad.status === "cancelled") && (
                    <Link to={`/dashboard-renew-advertisement/${ad.id}`}>
                      <button className="px-3 py-2 bg-green-100 text-green-700 text-xs font-semibold rounded hover:bg-green-200">
                        <MdOutlineAutorenew size={14} className="inline mr-1" />{" "}
                        Renew
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleToggleAutoRenew(ad.id, ad.autoRenew)}
                    disabled={
                      ad.status === "cancelled" || ad.status === "rejected"
                    }
                    className={`px-3 py-2 text-xs font-semibold rounded ${
                      ad.autoRenew
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    } ${
                      ad.status === "cancelled" || ad.status === "rejected"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-80"
                    }`}
                  >
                    {ad.autoRenew ? "✓ Auto-Renew" : "✗ Auto-Renew"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Data Grid */}
      <div className="hidden lg:block p-6">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
};

export default AllAdvertisements;
