import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

const SMHomepageAdPricing = () => {
  const [shopAdStatus, setShopAdStatus] = useState(null);

  const adTypes = [
    {
      id: "leaderboard",
      name: "Leaderboard Banner",
      size: "728×120 pixels",
      position: "Top of homepage, below header",
      price: 600,
      slots: 6,
      description:
        "Maximum visibility - the first thing visitors see when they land on the homepage.",
      features: [
        "Premium placement",
        "High visibility",
        "Supports video",
        "10-second rotation",
      ],
      recommended: true,
    },
    {
      id: "top_sidebar",
      name: "Top Sidebar",
      size: "200×120 pixels",
      position: "Left sidebar, top position",
      price: 200,
      slots: 5,
      description:
        "Prominent placement in the left sidebar, visible on all pages.",
      features: [
        "Always visible",
        "Compact design",
        "Good CTR",
        "Cost-effective",
      ],
    },
    {
      id: "right_sidebar_top",
      name: "Right Sidebar - Top",
      size: "300×200 pixels",
      position: "Right sidebar, first position",
      price: 300,
      slots: 5,
      description:
        "Prime real estate on the right sidebar with excellent visibility.",
      features: [
        "Large format",
        "Eye-catching",
        "Premium position",
        "High engagement",
      ],
    },
    {
      id: "right_sidebar_middle",
      name: "Right Sidebar - Middle",
      size: "300×200 pixels",
      position: "Right sidebar, middle position",
      price: 250,
      slots: 5,
      description:
        "Great visibility as users scroll through products and content.",
      features: [
        "Balanced exposure",
        "Good value",
        "Scroll visibility",
        "Consistent views",
      ],
    },
    {
      id: "right_sidebar_bottom",
      name: "Right Sidebar - Bottom",
      size: "300×200 pixels",
      position: "Right sidebar, bottom position",
      price: 200,
      slots: 5,
      description: "Budget-friendly option that still captures user attention.",
      features: [
        "Affordable",
        "Engaged viewers",
        "Quality placement",
        "Good for testing",
      ],
    },
  ];

  useEffect(() => {
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

  return (
    <div className="w-full mx-2 sm:mx-4 md:mx-6 lg:mx-8 pt-1 mt-4 sm:mt-6 md:mt-10">
      {/* Shop Exemption Banner */}
      {shopAdStatus?.adFeeExempt && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4 text-white rounded-t-lg mb-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="font-bold text-lg">
                {shopAdStatus.isInHouseStore
                  ? "IN-HOUSE STORE BENEFIT"
                  : "VIP PARTNER STATUS"}
              </h3>
              <p className="text-purple-100 text-sm">
                Your store is exempt from all advertising fees! All homepage ads
                are FREE and auto-approved.
                {shopAdStatus.adFeeExemptReason &&
                  ` (${shopAdStatus.adFeeExemptReason})`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 sm:px-6 py-6 rounded-t-lg">
        <div className="flex items-center gap-3 mb-2">
          <HiOutlineSpeakerphone className="w-10 h-10 text-white" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Homepage Advertising
          </h1>
        </div>
        <p className="text-orange-100 max-w-2xl">
          Promote your store to thousands of visitors with our premium homepage
          advertising slots. Choose from multiple positions and sizes to best
          showcase your products.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-white border-b px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">50K+</div>
          <div className="text-xs text-gray-500">Monthly Visitors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">10s</div>
          <div className="text-xs text-gray-500">Ad Rotation</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-xs text-gray-500">Visibility</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">Real-time</div>
          <div className="text-xs text-gray-500">Analytics</div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="bg-gray-50 p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Available Ad Positions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adTypes.map((adType) => (
            <div
              key={adType.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all hover:shadow-lg ${
                adType.recommended ? "border-orange-500" : "border-transparent"
              }`}
            >
              {adType.recommended && (
                <div className="bg-orange-500 text-white text-center py-1 text-sm font-semibold">
                  ⭐ RECOMMENDED
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {adType.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{adType.size}</p>

                <div className="flex items-baseline gap-1 mb-4">
                  {shopAdStatus?.adFeeExempt ? (
                    <>
                      <span className="text-3xl font-bold text-purple-600">
                        FREE
                      </span>
                      <span className="text-gray-400 line-through">
                        ${adType.price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        /month
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-800">
                        ${adType.price}
                      </span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {adType.description}
                </p>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    FEATURES
                  </div>
                  <ul className="space-y-1">
                    {adType.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <AiOutlineCheck className="text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <span className="font-semibold">{adType.slots} slots</span>{" "}
                  available • {adType.position}
                </div>

                <Link
                  to={`/store-manager/homepage-ads/create?type=${adType.id}`}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-center flex items-center justify-center gap-2 transition-colors ${
                    adType.recommended
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AiOutlinePlus />
                  Create Ad
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Info */}
      <div className="bg-white p-4 sm:p-6 border-t">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          💰 Save with Longer Commitments
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-500">1 Month</div>
            <div className="text-lg font-bold text-gray-700">0% off</div>
            <div className="text-xs text-gray-400">Standard rate</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-sm text-gray-500">3 Months</div>
            <div className="text-lg font-bold text-green-600">10% off</div>
            <div className="text-xs text-green-500">Save 10%</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-sm text-gray-500">6 Months</div>
            <div className="text-lg font-bold text-green-600">15% off</div>
            <div className="text-xs text-green-500">Best value</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg text-center border-2 border-orange-300">
            <div className="text-sm text-gray-500">12 Months</div>
            <div className="text-lg font-bold text-orange-600">20% off</div>
            <div className="text-xs text-orange-500">Maximum savings!</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 p-4 sm:p-6 border-t rounded-b-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          ❓ Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">
              How does ad rotation work?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Multiple ads can occupy the same slot. They rotate automatically
              every 10 seconds, giving each advertiser fair exposure.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">
              When will my ad go live?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              After payment, your ad will be reviewed by our admin team. Once
              approved, it goes live immediately.
              {shopAdStatus?.adFeeExempt &&
                " Since you're exempt from fees, your ads are auto-approved!"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">
              Can I upload video ads?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes! All positions support video ads (MP4/WEBM, max 10MB). Videos
              autoplay muted on the homepage.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">
              What analytics are available?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              You'll have access to real-time views, clicks, and click-through
              rate (CTR) for each ad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMHomepageAdPricing;
