import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { useCurrency } from "../../context/CurrencyContext";
import {
  FiTruck,
  FiShoppingBag,
  FiMapPin,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi";

/**
 * DeliveryChoice Component
 *
 * Allows buyers to choose between:
 * - COLLECT (Pick up from store)
 * - DELIVERY (Have it delivered to a district)
 *
 * Per SRS: "After clicking Checkout, the buyer is taken to a Delivery Choice Screen before payment."
 */
const DeliveryChoice = ({
  shopId,
  cartTotal,
  onDeliverySelect,
  initialMethod,
  initialDistrict,
}) => {
  const { formatPrice } = useCurrency();
  const [deliveryMethod, setDeliveryMethod] = useState(initialMethod || null);
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialDistrict || null
  );
  const [districts, setDistricts] = useState([]);
  const [vendorConfig, setVendorConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(null);
  const [deliveryUnavailableReason, setDeliveryUnavailableReason] =
    useState(null);

  // Fetch districts and vendor delivery config
  useEffect(() => {
    const fetchDeliveryData = async () => {
      if (!shopId) {
        console.log("[DeliveryChoice] No shopId provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(
          "[DeliveryChoice] Fetching delivery data for shopId:",
          shopId
        );

        // Fetch active districts
        const districtsRes = await axios.get(`${server}/district/all`);
        if (districtsRes.data.success) {
          setDistricts(districtsRes.data.districts || []);
          console.log(
            "[DeliveryChoice] Loaded districts:",
            districtsRes.data.districts?.length
          );
        }

        // Fetch vendor's delivery config
        const configRes = await axios.get(
          `${server}/vendor-delivery/config/${shopId}`
        );
        console.log("[DeliveryChoice] Vendor config response:", configRes.data);

        if (configRes.data.success) {
          setVendorConfig(configRes.data.config);
          console.log(
            "[DeliveryChoice] Vendor config loaded:",
            configRes.data.config
          );
        }
      } catch (error) {
        console.error("[DeliveryChoice] Error fetching delivery data:", error);
        // If no config found, vendor hasn't set up delivery yet
        if (error.response?.status === 404) {
          console.log("[DeliveryChoice] No vendor config found (404)");
          setVendorConfig(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Reset state when shopId changes
    setVendorConfig(null);
    setDeliveryMethod(initialMethod || null);
    setSelectedDistrict(initialDistrict || null);

    fetchDeliveryData();
  }, [shopId]);

  // Calculate delivery fee when district changes
  useEffect(() => {
    if (deliveryMethod === "DELIVERY" && selectedDistrict && vendorConfig) {
      // Get fee using the helper function
      const fee = getDistrictFee(selectedDistrict);

      // Get estimated days from vendor config or district default
      const districtFeeEntry = vendorConfig.districtFees?.find(
        (df) =>
          df.districtId === selectedDistrict ||
          df.districtId?._id === selectedDistrict
      );
      const district = districts.find((d) => d._id === selectedDistrict);
      const days =
        districtFeeEntry?.estimatedDays || district?.defaultEstimatedDays || 3;

      // Check for free delivery threshold
      if (
        vendorConfig.freeDeliveryThreshold &&
        cartTotal >= vendorConfig.freeDeliveryThreshold
      ) {
        setDeliveryFee(0);
        setEstimatedDays(days);
        setDeliveryUnavailableReason(null);
      } else {
        setDeliveryFee(fee);
        setEstimatedDays(days);
        setDeliveryUnavailableReason(null);
      }
    } else if (deliveryMethod === "COLLECT") {
      setDeliveryFee(0);
      setEstimatedDays(null);
      setDeliveryUnavailableReason(null);
    }
  }, [deliveryMethod, selectedDistrict, vendorConfig, cartTotal, districts]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onDeliverySelect && deliveryMethod) {
      const selectedDistrictObj = districts.find(
        (d) => d._id === selectedDistrict
      );

      onDeliverySelect({
        method: deliveryMethod,
        districtId: deliveryMethod === "DELIVERY" ? selectedDistrict : null,
        districtName:
          deliveryMethod === "DELIVERY" ? selectedDistrictObj?.name : null,
        districtCode:
          deliveryMethod === "DELIVERY" ? selectedDistrictObj?.code : null,
        deliveryFee,
        estimatedDays,
        isValid:
          deliveryMethod === "COLLECT"
            ? vendorConfig?.pickupEnabled !== false
            : selectedDistrict && !deliveryUnavailableReason,
        pickupAddress:
          deliveryMethod === "COLLECT" ? vendorConfig?.pickupAddress : null,
        pickupInstructions:
          deliveryMethod === "COLLECT"
            ? vendorConfig?.pickupInstructions
            : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deliveryMethod,
    selectedDistrict,
    deliveryFee,
    estimatedDays,
    deliveryUnavailableReason,
    // Note: onDeliverySelect intentionally excluded to prevent infinite loops
    // vendorConfig and districts are excluded as they're used for derived values only
  ]);

  // Get available districts
  // ONLY show districts that the vendor has explicitly configured fees for
  const getAvailableDistricts = () => {
    if (!vendorConfig) {
      return [];
    }

    // Vendor must have explicitly configured district fees to offer delivery
    if (vendorConfig.districtFees && vendorConfig.districtFees.length > 0) {
      const availableDistricts = districts.filter((district) =>
        vendorConfig.districtFees.some(
          (df) =>
            (df.districtId === district._id ||
              df.districtId?._id === district._id) &&
            df.isAvailable
        )
      );
      return availableDistricts;
    }

    // No districts configured = no delivery (pickup only)
    return [];
  };

  // Get fee for a district (vendor-specific or default)
  const getDistrictFee = (districtId) => {
    if (vendorConfig?.districtFees && vendorConfig.districtFees.length > 0) {
      const districtFee = vendorConfig.districtFees.find(
        (df) =>
          df.districtId === districtId || df.districtId?._id === districtId
      );
      return districtFee?.fee ?? vendorConfig.defaultDeliveryFee ?? 0;
    }
    // Use district's default fee or vendor's default fee
    const district = districts.find((d) => d._id === districtId);
    return (
      vendorConfig?.defaultDeliveryFee ?? district?.defaultDeliveryFee ?? 0
    );
  };

  const availableDistricts = getAvailableDistricts();

  // Check if vendor has actually configured delivery (not just hasNoConfig with default pickup)
  const hasActualConfig = vendorConfig && !vendorConfig.hasNoConfig;
  const isDeliveryEnabled =
    hasActualConfig &&
    vendorConfig?.deliveryEnabled &&
    availableDistricts.length > 0;
  const isPickupEnabled = true; // Pickup (Collect) is ALWAYS available for all vendors

  // Log state for debugging (only once when values change)
  useEffect(() => {
    console.log("[DeliveryChoice] State:", {
      shopId,
      vendorConfigExists: !!vendorConfig,
      hasNoConfig: vendorConfig?.hasNoConfig,
      hasActualConfig,
      deliveryEnabled: vendorConfig?.deliveryEnabled,
      pickupEnabled: vendorConfig?.pickupEnabled,
      districtFeesCount: vendorConfig?.districtFees?.length || 0,
      availableDistrictsCount: availableDistricts.length,
      isDeliveryEnabled,
      isPickupEnabled,
    });
  }, [
    shopId,
    vendorConfig?.hasNoConfig,
    vendorConfig?.deliveryEnabled,
    availableDistricts.length,
  ]);

  // Check if free delivery is applicable
  const qualifiesForFreeDelivery =
    vendorConfig?.freeDeliveryThreshold &&
    cartTotal >= vendorConfig.freeDeliveryThreshold;
  const amountToFreeDelivery = vendorConfig?.freeDeliveryThreshold
    ? vendorConfig.freeDeliveryThreshold - cartTotal
    : null;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Delivery Method
              </h2>
              <p className="text-blue-100 text-sm">
                Loading delivery options...
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // If vendor hasn't configured delivery at all AND API actually failed
  // (Not when hasNoConfig is true - that's a valid response meaning pickup only)
  if (!vendorConfig) {
    // Auto-select Collect for vendors without any config
    if (!deliveryMethod) {
      setDeliveryMethod("COLLECT");
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Collection Only
              </h2>
              <p className="text-green-100 text-sm">
                Pick up your order from the vendor
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm flex items-center">
              <FiCheck className="inline mr-2 text-green-600" />
              Your order will be available for collection. The vendor will
              contact you with pickup details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If vendor has hasNoConfig flag, show Collect Only UI
  if (vendorConfig.hasNoConfig) {
    // Auto-select Collect for vendors without any config
    if (!deliveryMethod) {
      setDeliveryMethod("COLLECT");
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Collection Only
              </h2>
              <p className="text-green-100 text-sm">
                Pick up your order from the vendor
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Collect</h3>
              <p className="text-sm text-gray-600">
                Pick up from vendor location
              </p>
              <p className="text-sm font-bold text-green-600">FREE</p>
            </div>
            <div className="ml-auto">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            This vendor offers collection only. Delivery options coming soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              How would you like to receive your order?
            </h2>
            <p className="text-blue-100 text-sm">
              Choose between pickup or delivery
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="p-6 space-y-4">
        {/* Free Delivery Progress */}
        {vendorConfig?.freeDeliveryThreshold &&
          amountToFreeDelivery > 0 &&
          deliveryMethod === "DELIVERY" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-700 text-sm">
                <FiInfo className="w-4 h-4 flex-shrink-0" />
                <span>
                  Add <strong>{formatPrice(amountToFreeDelivery)}</strong> more
                  to qualify for free delivery!
                </span>
              </div>
            </div>
          )}

        {qualifiesForFreeDelivery && deliveryMethod === "DELIVERY" && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-800 text-sm font-medium">
              <FiCheck className="w-4 h-4 flex-shrink-0" />
              <span>🎉 You qualify for FREE delivery!</span>
            </div>
          </div>
        )}

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* COLLECT Option */}
          <button
            onClick={() => setDeliveryMethod("COLLECT")}
            disabled={!isPickupEnabled}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              deliveryMethod === "COLLECT"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : isPickupEnabled
                ? "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
            }`}
          >
            {deliveryMethod === "COLLECT" && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  deliveryMethod === "COLLECT"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FiShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Collect</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pick up from vendor location
                </p>
                <div className="mt-3 flex items-center text-green-600 font-medium">
                  <span>FREE</span>
                </div>
              </div>
            </div>

            {!isPickupEnabled && (
              <div className="mt-3 text-xs text-red-600">
                <FiAlertCircle className="inline mr-1" />
                Pickup not available for this vendor
              </div>
            )}
          </button>

          {/* DELIVERY Option */}
          <button
            onClick={() => setDeliveryMethod("DELIVERY")}
            disabled={!isDeliveryEnabled}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left ${
              deliveryMethod === "DELIVERY"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : isDeliveryEnabled
                ? "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
            }`}
          >
            {deliveryMethod === "DELIVERY" && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  deliveryMethod === "DELIVERY"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FiTruck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Delivery
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Deliver to your district
                </p>
                <div className="mt-3 flex items-center text-gray-700 font-medium">
                  <span>Fee varies by district</span>
                </div>
              </div>
            </div>

            {!isDeliveryEnabled && (
              <div className="mt-3 text-xs text-red-600">
                <FiAlertCircle className="inline mr-1" />
                {!vendorConfig?.deliveryEnabled
                  ? "Delivery not enabled by vendor"
                  : "No districts configured for delivery"}
              </div>
            )}
          </button>
        </div>

        {/* District Selection (when DELIVERY is selected) */}
        {deliveryMethod === "DELIVERY" && isDeliveryEnabled && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FiMapPin className="inline mr-2" />
                Select Your District *
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict || ""}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
                >
                  <option value="">-- Select a district --</option>
                  {availableDistricts.map((district) => {
                    const fee = getDistrictFee(district._id);
                    return (
                      <option key={district._id} value={district._id}>
                        {district.name} -{" "}
                        {qualifiesForFreeDelivery ? "FREE" : formatPrice(fee)}
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Selected District Info */}
            {selectedDistrict && !deliveryUnavailableReason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">
                      Delivery to{" "}
                      {districts.find((d) => d._id === selectedDistrict)?.name}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold">
                          {deliveryFee === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            formatPrice(deliveryFee)
                          )}
                        </span>
                      </div>
                      {estimatedDays && (
                        <div className="flex justify-between">
                          <span>
                            <FiClock className="inline mr-1" />
                            Estimated Delivery:
                          </span>
                          <span>{estimatedDays} business day(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Unavailable Message */}
            {deliveryUnavailableReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">
                      Delivery Unavailable
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {deliveryUnavailableReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pickup Info (when COLLECT is selected) */}
        {deliveryMethod === "COLLECT" && isPickupEnabled && (
          <div className="mt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FiShoppingBag className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Pickup Information
                  </h4>
                  {vendorConfig?.pickupAddress ? (
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="mt-1">{vendorConfig.pickupAddress}</p>
                      </div>
                      {vendorConfig?.pickupInstructions && (
                        <div>
                          <span className="font-medium">Instructions:</span>
                          <p className="mt-1 text-gray-500">
                            {vendorConfig.pickupInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Pickup address will be provided in your order confirmation
                      email.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryChoice;
