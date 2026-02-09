import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { useCurrency } from "../../context/CurrencyContext";

const SMCreateHomepageAd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get("type");
  const { formatPrice } = useCurrency();

  const [shop, setShop] = useState(null);
  const [adType, setAdType] = useState(preselectedType || "leaderboard");
  const [slotNumber, setSlotNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Product linking
  const [linkType, setLinkType] = useState("shop");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Ad type information
  const adTypes = {
    leaderboard: {
      name: "Leaderboard",
      size: "728×120",
      price: 600,
      hasSlots: true,
    },
    top_sidebar: {
      name: "Top Sidebar",
      size: "200×120",
      price: 200,
      hasSlots: true,
    },
    right_sidebar_top: {
      name: "Right Sidebar Top",
      size: "300×200",
      price: 300,
      hasSlots: true,
    },
    right_sidebar_middle: {
      name: "Right Sidebar Middle",
      size: "300×200",
      price: 250,
      hasSlots: true,
    },
    right_sidebar_bottom: {
      name: "Right Sidebar Bottom",
      size: "300×200",
      price: 200,
      hasSlots: true,
    },
  };

  // Fetch the shop the store manager is assigned to
  useEffect(() => {
    const fetchAssignedShop = async () => {
      try {
        const { data } = await axios.get(
          `${server}/store-manager-advertisement/shop-ad-fee-status`,
          { withCredentials: true },
        );
        if (data.success) {
          setShop(data.shop);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
        toast.error("Failed to load shop information");
      }
    };
    fetchAssignedShop();
  }, []);

  // Fetch shop's products for linking
  useEffect(() => {
    const fetchProducts = async () => {
      if (!shop?._id) return;

      try {
        setLoadingProducts(true);
        const { data } = await axios.get(
          `${server}/product/get-all-products-shop/${shop._id}`,
          { withCredentials: true },
        );
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (shop?._id) {
      fetchProducts();
    }
  }, [shop?._id]);

  // Calculate pricing when ad type or duration changes
  useEffect(() => {
    if (shop?._id) {
      calculatePrice();
    }
    if (adTypes[adType]?.hasSlots) {
      fetchAvailableSlots();
    }
  }, [adType, duration, shop?._id]);

  const calculatePrice = async () => {
    try {
      const { data } = await axios.post(
        `${server}/advertisement/calculate-price`,
        {
          adType,
          duration: parseInt(duration),
          shopId: shop?._id, // Pass the shop ID to check for ad fee exemption
        },
        { withCredentials: true },
      );

      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const [slotInfo, setSlotInfo] = useState([]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const { data } = await axios.get(
        `${server}/advertisement/available-slots/${adType}`,
        { withCredentials: true },
      );

      if (data.success) {
        setAvailableSlots(data.availableSlots || []);
        setSlotInfo(data.slotInfo || []);
        if (data.availableSlots?.length > 0) {
          setSlotNumber(data.availableSlots[0].toString());
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");
      setMedia(file);

      if (isVideo) {
        setMediaPreview(URL.createObjectURL(file));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (adTypes[adType].hasSlots && !slotNumber) {
      toast.error("Please select a slot number");
      return;
    }

    if (!media) {
      toast.error("Please upload an ad image or video");
      return;
    }

    if (linkType === "product" && !selectedProduct) {
      toast.error("Please select a product to link to");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("adType", adType);
      if (adTypes[adType].hasSlots) {
        formData.append("slotNumber", slotNumber);
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("autoRenew", autoRenew);
      formData.append("image", media);

      if (linkType === "product" && selectedProduct) {
        formData.append("productId", selectedProduct);
      }

      const { data } = await axios.post(
        `${server}/advertisement/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (data.success) {
        if (data.autoApproved) {
          toast.success(
            "🎉 Advertisement created and AUTO-APPROVED! Your ad is now LIVE!",
          );
          setTimeout(() => {
            navigate(`/store-manager/homepage-ads`);
          }, 1500);
        } else if (pricing?.isFree) {
          toast.success(
            "🎉 Advertisement created (FREE)! Awaiting admin approval.",
          );
          setTimeout(() => {
            navigate(`/store-manager/homepage-ads`);
          }, 1500);
        } else {
          toast.success("Advertisement created! Redirecting to payment...");
          setTimeout(() => {
            navigate(
              `/store-manager/homepage-ads/payment/${data.advertisement._id}`,
            );
          }, 1500);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create advertisement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-2 sm:mx-4 md:mx-6 lg:mx-8 pt-1 mt-4 sm:mt-6 md:mt-10 bg-white rounded-lg shadow-md">
      {/* Shop Exemption Banner */}
      {shop?.adFeeExempt && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            {shop.isInHouseStore ? (
              <span className="font-medium">🏪 IN-HOUSE STORE</span>
            ) : (
              <span className="font-medium">✨ VIP PARTNER</span>
            )}
            <span className="text-purple-200 ml-2">|</span>
            <span className="text-purple-100 text-sm">
              Your store is exempt from advertising fees - All homepage ads are
              FREE and auto-approved!
            </span>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <HiOutlineSpeakerphone className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Create Homepage Ad
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 mt-1">
                {shop?.name ? `For: ${shop.name}` : "Loading shop..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Ad Type Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Advertisement Type *
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              >
                {Object.entries(adTypes).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} - {info.size} - ${info.price}/month
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Number */}
            {adTypes[adType].hasSlots && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Slot Number *{" "}
                  {loadingSlots && (
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      (Loading...)
                    </span>
                  )}
                </label>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                  🔄 Multiple ads can share the same slot - ads rotate every 10
                  seconds
                </p>
                {availableSlots.length > 0 ? (
                  <>
                    <select
                      value={slotNumber}
                      onChange={(e) => setSlotNumber(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                      required
                    >
                      {slotInfo
                        .filter((s) => s.available)
                        .map((slot) => (
                          <option key={slot.slot} value={slot.slot}>
                            Slot {slot.slot}{" "}
                            {slot.adsCount > 0
                              ? `(${slot.adsCount} ad${slot.adsCount > 1 ? "s" : ""} in rotation)`
                              : "(Empty - Your ad only!)"}
                          </option>
                        ))}
                    </select>
                    {slotInfo.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                        {slotInfo.map((slot) => (
                          <div
                            key={slot.slot}
                            className={`text-center p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs ${
                              slot.sellerHasAd
                                ? "bg-yellow-100 border border-yellow-300 text-yellow-700"
                                : slot.adsCount > 0
                                  ? "bg-blue-50 border border-blue-200 text-blue-600"
                                  : "bg-green-50 border border-green-200 text-green-600"
                            }`}
                          >
                            <div className="font-bold">#{slot.slot}</div>
                            <div className="text-[8px] sm:text-[10px]">
                              {slot.sellerHasAd
                                ? "Your Ad"
                                : `${slot.adsCount} ads`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs sm:text-sm">
                    ⚠️ You already have ads in all slots. Wait for them to
                    expire or try another type.
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter catchy ad title"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/100
              </div>
            </div>

            {/* Link Destination */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                🔗 Where should this ad link to?
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="linkType"
                    value="shop"
                    checked={linkType === "shop"}
                    onChange={(e) => {
                      setLinkType(e.target.value);
                      setSelectedProduct("");
                    }}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-700">
                    Store Page
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="linkType"
                    value="product"
                    checked={linkType === "product"}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-700">
                    Specific Product
                  </span>
                </label>
              </div>

              {linkType === "product" && (
                <div>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                    required={linkType === "product"}
                  >
                    <option value="">-- Select a Product --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} -{" "}
                          {formatPrice(
                            product.discountPrice || product.originalPrice,
                          )}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedProduct && (
                    <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border">
                      {products.find((p) => p._id === selectedProduct)
                        ?.images?.[0]?.url && (
                        <img
                          src={
                            products.find((p) => p._id === selectedProduct)
                              ?.images[0].url
                          }
                          alt="Product"
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="text-xs sm:text-sm min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {
                            products.find((p) => p._id === selectedProduct)
                              ?.name
                          }
                        </p>
                        <p className="text-[10px] sm:text-xs text-green-600">
                          ✓ Ad will link to this product
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {linkType === "shop" && (
                <p className="text-xs text-gray-600">
                  ✓ Ad will link to the store page
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Describe your advertisement"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value={1}>1 Month (0% discount)</option>
                <option value={3}>3 Months (10% discount)</option>
                <option value={6}>6 Months (15% discount)</option>
                <option value={12}>12 Months (20% discount)</option>
              </select>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="mt-0.5 sm:mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="autoRenew" className="ml-2 sm:ml-3">
                <span className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Enable Auto-Renewal
                </span>
                <span className="block text-[10px] sm:text-xs text-gray-500">
                  Automatically renew this ad when it expires
                </span>
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Media Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Ad Media * ({adTypes[adType].size})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-6 text-center hover:border-orange-500 transition-colors">
                {mediaPreview ? (
                  <div className="relative">
                    {mediaType === "video" ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-w-full h-auto rounded mx-auto max-h-[300px]"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded mx-auto"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(null);
                        setMediaPreview(null);
                        setMediaType("image");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <AiOutlineClose />
                    </button>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          mediaType === "video"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="adMedia"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="adMedia"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                        Click to upload image or video
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, MP4, WEBM
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                <div className="flex items-start">
                  <BsInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <div className="text-[10px] sm:text-xs text-blue-800">
                    <strong>Requirements:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>
                        Images: {adTypes[adType].size} pixels, JPG/PNG, max
                        500KB
                      </li>
                      <li>
                        Videos: MP4/WEBM, max 10MB, 30 seconds recommended
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div
                className={`border-2 rounded-lg p-3 sm:p-4 md:p-6 ${
                  pricing.isFree
                    ? pricing.isShopAdFeeExempt
                      ? "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400"
                      : "bg-gradient-to-br from-green-50 to-green-100 border-green-400"
                    : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Pricing Summary
                  </h3>
                  {pricing.isFree && (
                    <span
                      className={`text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse ${
                        pricing.isShopAdFeeExempt
                          ? "bg-purple-500"
                          : "bg-green-500"
                      }`}
                    >
                      {pricing.isShopAdFeeExempt
                        ? "🏪 IN-HOUSE STORE"
                        : "🎁 FREE"}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.basePrice}/month
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {pricing.duration} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.totalMonthlyPrice}
                    </span>
                  </div>
                  {pricing.discount > 0 && !pricing.isFree && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({pricing.discount}%):</span>
                      <span className="font-semibold">
                        -${pricing.discountAmount}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-orange-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Total:</span>
                      {pricing.isFree ? (
                        <span
                          className={`font-bold text-xl ${
                            pricing.isShopAdFeeExempt
                              ? "text-purple-600"
                              : "text-green-600"
                          }`}
                        >
                          FREE!
                        </span>
                      ) : (
                        <span className="font-bold text-orange-600">
                          ${pricing.totalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {pricing.isFree && (
                  <div
                    className={`mt-4 text-xs rounded p-2 ${
                      pricing.isShopAdFeeExempt
                        ? "text-purple-700 bg-white/70"
                        : "text-green-700 bg-white/70"
                    }`}
                  >
                    {pricing.isShopAdFeeExempt ? (
                      <>
                        🏪 <strong>In-House Store Benefit!</strong> Your store
                        is exempt from advertising fees. No payment required -
                        your ad will be auto-approved!
                      </>
                    ) : (
                      <>
                        🎉 <strong>Free Mode Active!</strong> No payment
                        required.
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-bold text-yellow-800 mb-2">
                📋 Important Notes
              </h4>
              <ul className="text-[10px] sm:text-xs text-yellow-700 space-y-0.5 sm:space-y-1 list-disc list-inside">
                <li>All ads require admin approval before going live</li>
                <li>Banner ads rotate every 10 seconds</li>
                <li>Payment is processed before approval</li>
                <li>Expiry warning sent 7 days before end date</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t">
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/store-manager/homepage-ads")}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (adTypes[adType].hasSlots && availableSlots.length === 0)
              }
              className={`px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base ${
                pricing?.isFree
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {loading
                ? "Creating..."
                : pricing?.isFree
                  ? "Create Ad (Free)"
                  : "Create & Pay"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SMCreateHomepageAd;
