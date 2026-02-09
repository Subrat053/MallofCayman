import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { MdOutlineAdsClick, MdInfo } from "react-icons/md";
import { BiDollar } from "react-icons/bi";
import { FiEye, FiMousePointer } from "react-icons/fi";

const SMAdPlanManagement = () => {
  const [adTypes, setAdTypes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default ad types configuration
  const defaultAdTypes = [
    {
      adType: "store_banner",
      name: "Store Banner",
      size: "728x120",
      description: "Large banner at the top of your store page",
      position: "Store page header",
    },
    {
      adType: "store_sidebar",
      name: "Store Sidebar",
      size: "300x200",
      description: "Sidebar advertisement on store page",
      position: "Store page sidebar",
    },
    {
      adType: "product_highlight",
      name: "Product Highlight",
      size: "Product Card",
      description: "Highlight a specific product",
      position: "Featured section",
    },
    {
      adType: "store_announcement",
      name: "Store Announcement",
      size: "Text/Image",
      description: "Store-wide announcement banner",
      position: "Store page top",
    },
    {
      adType: "seasonal_promo",
      name: "Seasonal Promo",
      size: "728x120",
      description: "Seasonal or holiday promotion",
      position: "Store page",
    },
    {
      adType: "clearance_sale",
      name: "Clearance Sale",
      size: "728x120",
      description: "Clearance and sale promotion",
      position: "Store page",
    },
    {
      adType: "new_arrival",
      name: "New Arrival",
      size: "300x200",
      description: "Spotlight new products",
      position: "Store page",
    },
    {
      adType: "flash_deal",
      name: "Flash Deal",
      size: "300x200",
      description: "Time-limited flash deal",
      position: "Store page",
    },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch ad types
      const typesRes = await axios.get(
        `${server}/store-manager-advertisement/ad-types`,
        { withCredentials: true },
      );

      if (typesRes.data.success && typesRes.data.adTypes?.length > 0) {
        setAdTypes(typesRes.data.adTypes);
      } else {
        setAdTypes(defaultAdTypes);
      }

      // Fetch statistics
      const statsRes = await axios.get(
        `${server}/store-manager-advertisement/statistics`,
        { withCredentials: true },
      );

      if (statsRes.data.success) {
        setStatistics(statsRes.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAdTypes(defaultAdTypes);
      if (error.response?.status !== 403) {
        toast.error("Failed to load ad information");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-2 sm:mx-4 800px:mx-8 pt-1 mt-4 sm:mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-3 sm:p-6 border-b bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <MdOutlineAdsClick className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Ad Types Overview
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Available advertisement types for your store
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {/* Statistics Section */}
        {statistics && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
              <BiDollar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
              Your Ad Statistics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-lg border-l-4 border-emerald-500">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Ads
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                  {statistics.totals?.totalAds || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiEye size={12} /> Views
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-700">
                  {statistics.totals?.totalViews?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiMousePointer size={12} /> Clicks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-700">
                  {statistics.totals?.totalClicks?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">CTR</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-700">
                  {statistics.overallCTR || "0%"}
                </div>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-600">
                  {statistics.byStatus?.draft || 0}
                </div>
                <div className="text-xs text-gray-500">Draft</div>
              </div>
              <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-600">
                  {statistics.byStatus?.pending || 0}
                </div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {statistics.byStatus?.active || 0}
                </div>
                <div className="text-xs text-green-600">Active</div>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {statistics.byStatus?.paused || 0}
                </div>
                <div className="text-xs text-blue-600">Paused</div>
              </div>
              <div className="bg-gray-100 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-500">
                  {statistics.byStatus?.expired || 0}
                </div>
                <div className="text-xs text-gray-500">Expired</div>
              </div>
              <div className="bg-red-50 p-2 sm:p-3 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-red-600">
                  {statistics.byStatus?.cancelled || 0}
                </div>
                <div className="text-xs text-red-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Types Grid */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
            <MdInfo className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
            Available Ad Types
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {adTypes.map((adType) => (
              <div
                key={adType.adType}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800">{adType.name}</h4>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    {adType.size}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {adType.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {adType.position}
                  </span>
                </div>
                {statistics?.byType?.[adType.adType] > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-emerald-600 font-medium">
                      {statistics.byType[adType.adType]} active ad
                      {statistics.byType[adType.adType] > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 sm:mt-8 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
          <h4 className="font-bold text-emerald-800 mb-2 sm:mb-3 text-sm sm:text-base">
            📋 Store Manager Ad System
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-emerald-700">
            <ul className="space-y-2 list-disc list-inside">
              <li>Create and manage ads for your store</li>
              <li>Image & Video ads supported</li>
              <li>Set custom duration for each ad</li>
              <li>Target specific audiences</li>
            </ul>
            <ul className="space-y-2 list-disc list-inside">
              <li>Track views and click-through rates</li>
              <li>Pause or activate ads anytime</li>
              <li>Highlight products or announce sales</li>
              <li>Ads display on your store page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMAdPlanManagement;
