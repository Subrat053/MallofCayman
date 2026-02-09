import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePause,
  AiOutlinePlayCircle,
  AiOutlineCopy,
} from "react-icons/ai";
import { FiMousePointer, FiCalendar } from "react-icons/fi";
import { MdOutlineAdsClick, MdStorefront, MdVerified } from "react-icons/md";

const SMAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [adTypeFilter, setAdTypeFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [shopAdStatus, setShopAdStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdvertisements();
    fetchShopAdStatus();
  }, [statusFilter, adTypeFilter]);

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
      let url = `${server}/store-manager-advertisement/my-ads?`;
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (adTypeFilter !== "all") url += `adType=${adTypeFilter}`;

      const { data } = await axios.get(url, { withCredentials: true });

      if (data.success) {
        setAds(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      if (error.response?.status !== 403) {
        toast.error("Failed to load advertisements");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ad, newStatus) => {
    try {
      const { data } = await axios.put(
        `${server}/store-manager-advertisement/ad/${ad._id}/status`,
        { status: newStatus },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDuplicate = async (ad) => {
    try {
      const { data } = await axios.post(
        `${server}/store-manager-advertisement/ad/${ad._id}/duplicate`,
        {},
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Advertisement duplicated successfully");
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to duplicate advertisement",
      );
    }
  };

  const handleDeleteClick = (ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedAd) return;

    try {
      const { data } = await axios.delete(
        `${server}/store-manager-advertisement/ad/${selectedAd._id}`,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Advertisement deleted successfully");
        setShowDeleteModal(false);
        setSelectedAd(null);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete advertisement",
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-gray-200 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAdTypeName = (type) => {
    const types = {
      store_banner: "Store Banner",
      store_sidebar: "Store Sidebar",
      product_highlight: "Product Highlight",
      store_announcement: "Announcement",
      seasonal_promo: "Seasonal Promo",
      clearance_sale: "Clearance Sale",
      new_arrival: "New Arrival",
      flash_deal: "Flash Deal",
    };
    return types[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const adTypes = [
    "all",
    "store_banner",
    "store_sidebar",
    "product_highlight",
    "store_announcement",
    "seasonal_promo",
    "clearance_sale",
    "new_arrival",
    "flash_deal",
  ];

  return (
    <div className="w-full mx-2 sm:mx-4 800px:mx-8 pt-1 mt-4 sm:mt-10 bg-white rounded-lg shadow-md">
      {/* Shop Exemption Banner */}
      {shopAdStatus?.adFeeExempt && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            {shopAdStatus.isInHouseStore ? (
              <>
                <MdStorefront className="w-5 h-5" />
                <span className="font-medium">🏪 IN-HOUSE STORE</span>
              </>
            ) : (
              <>
                <MdVerified className="w-5 h-5" />
                <span className="font-medium">✨ VIP PARTNER</span>
              </>
            )}
            <span className="text-purple-200 ml-2">|</span>
            <span className="text-purple-100 text-sm">
              Your store is exempt from advertising fees
              {shopAdStatus.adFeeExemptReason &&
                ` - ${shopAdStatus.adFeeExemptReason}`}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-3 sm:p-6 border-b bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <MdOutlineAdsClick className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                My Advertisements
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                Manage your store advertisements
              </p>
            </div>
          </div>
          <Link
            to="/store-manager/create-advertisement"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold text-sm transition-colors"
          >
            <AiOutlinePlus size={18} />
            Create Ad
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-6 border-b space-y-3">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            "all",
            "draft",
            "pending",
            "active",
            "paused",
            "expired",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                statusFilter === status
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Ad Type Filter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="text-xs text-gray-500 self-center mr-2">Type:</span>
          {adTypes.map((type) => (
            <button
              key={type}
              onClick={() => setAdTypeFilter(type)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-xs transition-colors ${
                adTypeFilter === type
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "All Types" : getAdTypeName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 p-3 sm:p-6 border-b">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 rounded-lg border-l-4 border-gray-400">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-700">
            {ads.filter((ad) => ad.status === "draft").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-2 sm:p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">
            Pending
          </div>
          <div className="text-lg sm:text-2xl font-bold text-yellow-700">
            {ads.filter((ad) => ad.status === "pending").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">
            Active
          </div>
          <div className="text-lg sm:text-2xl font-bold text-green-700">
            {ads.filter((ad) => ad.status === "active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">
            Paused
          </div>
          <div className="text-lg sm:text-2xl font-bold text-blue-700">
            {ads.filter((ad) => ad.status === "paused").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 sm:p-4 rounded-lg border-l-4 border-gray-500">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">
            Expired
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-600">
            {ads.filter((ad) => ad.status === "expired").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 sm:p-4 rounded-lg border-l-4 border-red-500">
          <div className="text-[10px] sm:text-sm text-gray-600 mb-1">
            Cancelled
          </div>
          <div className="text-lg sm:text-2xl font-bold text-red-700">
            {ads.filter((ad) => ad.status === "cancelled").length}
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="p-3 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-10">
            <MdOutlineAdsClick className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Advertisements Found
            </h3>
            <p className="text-gray-500 mb-4">
              {statusFilter !== "all" || adTypeFilter !== "all"
                ? "Try changing your filters"
                : "Create your first advertisement to promote your store"}
            </p>
            <Link
              to="/store-manager/create-advertisement"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <AiOutlinePlus /> Create Your First Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Ad Image/Video */}
                <div className="relative h-40 bg-gray-100">
                  {ad.mediaType === "video" && ad.video?.url ? (
                    <video
                      src={ad.video.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : ad.image?.url ? (
                    <img
                      src={ad.image.url}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MdOutlineAdsClick size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        ad.status,
                      )}`}
                    >
                      {ad.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-black/60 text-white rounded text-xs">
                      {getAdTypeName(ad.adType)}
                    </span>
                  </div>
                </div>

                {/* Ad Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate">
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ad.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <AiOutlineEye size={14} />
                      <span>{ad.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMousePointer size={14} />
                      <span>{ad.clicks?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <FiCalendar size={12} />
                      <span>{formatDate(ad.endDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {ad.status === "active" && (
                        <button
                          onClick={() => handleToggleStatus(ad, "paused")}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Pause"
                        >
                          <AiOutlinePause size={18} />
                        </button>
                      )}
                      {(ad.status === "paused" || ad.status === "draft") && (
                        <button
                          onClick={() => handleToggleStatus(ad, "active")}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Activate"
                        >
                          <AiOutlinePlayCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(ad)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Duplicate"
                      >
                        <AiOutlineCopy size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          navigate(
                            `/store-manager/edit-advertisement/${ad._id}`,
                          )
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <AiOutlineEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Delete Advertisement
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedAd.title}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAd(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMAdvertisements;
