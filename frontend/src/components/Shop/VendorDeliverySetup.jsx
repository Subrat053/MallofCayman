import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiTruck,
  FiPackage,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiInfo,
  FiCheck,
  FiX,
  FiEdit3,
  FiHome,
} from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

const VendorDeliverySetup = () => {
  const { seller } = useSelector((state) => state.seller);
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [allDistricts, setAllDistricts] = useState([]);
  const [editingFees, setEditingFees] = useState({});

  // Load configuration
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/vendor-delivery/my-config`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setConfig(response.data.config);
        setAllDistricts(response.data.allDistricts || []);

        // Initialize editing fees from existing config
        const fees = {};
        if (response.data.config?.districtFees) {
          response.data.config.districtFees.forEach((df) => {
            fees[df.districtId] = {
              fee: df.fee,
              isAvailable: df.isAvailable,
              estimatedDays: df.estimatedDays,
            };
          });
        }
        setEditingFees(fees);
      }
    } catch (error) {
      console.error("Error loading delivery config:", error);
      toast.error("Failed to load delivery configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Toggle delivery enabled
  const toggleDelivery = async () => {
    try {
      const response = await axios.put(
        `${server}/vendor-delivery/toggle-delivery`,
        { enabled: !config.deliveryEnabled },
        { withCredentials: true }
      );

      if (response.data.success) {
        setConfig((prev) => ({
          ...prev,
          deliveryEnabled: response.data.deliveryEnabled,
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle delivery");
    }
  };

  // Update local fee value
  const updateLocalFee = (districtId, field, value) => {
    setEditingFees((prev) => ({
      ...prev,
      [districtId]: {
        ...prev[districtId],
        [field]: value,
      },
    }));
  };

  // Save all fees
  const saveAllFees = async () => {
    try {
      setSaving(true);

      // Prepare fees array
      const fees = Object.entries(editingFees)
        .filter(([_, data]) => data.fee !== undefined && data.fee !== "")
        .map(([districtId, data]) => ({
          districtId,
          fee: parseFloat(data.fee) || 0,
          isAvailable: data.isAvailable !== false,
          estimatedDays: data.estimatedDays,
        }));

      const response = await axios.post(
        `${server}/vendor-delivery/save-config`,
        {
          deliveryEnabled: config.deliveryEnabled,
          pickupEnabled: config.pickupEnabled,
          districtFees: fees,
          freeDeliveryThreshold: config.freeDeliveryThreshold,
          pickupAddress: config.pickupAddress,
          pickupInstructions: config.pickupInstructions,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Delivery configuration saved successfully!");
        loadConfig(); // Reload to get fresh data
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  // Update config field
  const updateConfigField = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get configured districts count
  const getConfiguredDistrictsCount = () => {
    return Object.values(editingFees).filter(
      (df) => df.fee !== undefined && df.fee !== "" && df.isAvailable
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FiTruck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Setup
                </h1>
                <p className="text-gray-600">
                  Configure delivery fees for your store
                </p>
              </div>
            </div>

            <button
              onClick={saveAllFees}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delivery Toggle Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  config?.deliveryEnabled
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <FiTruck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Offer Delivery
                </h2>
                <p className="text-sm text-gray-600">
                  {config?.deliveryEnabled
                    ? "Customers can choose delivery at checkout"
                    : "Delivery is disabled - customers can only collect/pickup"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleDelivery}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config?.deliveryEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config?.deliveryEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Warning if delivery enabled but no districts */}
          {config?.deliveryEnabled && getConfiguredDistrictsCount() === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <FiInfo className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  No Districts Configured
                </p>
                <p className="text-sm text-yellow-700">
                  Delivery is enabled but you haven't set fees for any
                  districts. Customers won't be able to select delivery at
                  checkout until you configure at least one district below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collection/Pickup Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiHome className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Collection (Pickup) Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Collection</p>
                <p className="text-sm text-gray-600">
                  Allow customers to pick up orders from your store
                </p>
              </div>
              <button
                onClick={() =>
                  updateConfigField("pickupEnabled", !config?.pickupEnabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config?.pickupEnabled ? "bg-purple-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config?.pickupEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {config?.pickupEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Address
                  </label>
                  <input
                    type="text"
                    value={config?.pickupAddress || ""}
                    onChange={(e) =>
                      updateConfigField("pickupAddress", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your store address for pickup"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Instructions
                  </label>
                  <textarea
                    value={config?.pickupInstructions || ""}
                    onChange={(e) =>
                      updateConfigField("pickupInstructions", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Please bring your order confirmation..."
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Free Delivery Threshold */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiDollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Free Delivery Threshold
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Orders above this amount get free delivery
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency?.symbol || "$"}
                </span>
                <input
                  type="number"
                  value={config?.freeDeliveryThreshold || ""}
                  onChange={(e) =>
                    updateConfigField(
                      "freeDeliveryThreshold",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Leave empty to disable"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave empty if you don't want to offer free delivery
          </p>
        </div>

        {/* District Fees Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiMapPin className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    District Delivery Fees
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set delivery fees for each district. Leave empty for
                    districts you don't deliver to.
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {getConfiguredDistrictsCount()} of {allDistricts.length}{" "}
                configured
              </div>
            </div>
          </div>

          {allDistricts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiMapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Districts Available</p>
              <p className="text-sm">
                Contact admin to add delivery districts for your region.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Fee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est. Days
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allDistricts.map((district) => {
                    const feeData = editingFees[district._id] || {};
                    const isConfigured =
                      feeData.fee !== undefined && feeData.fee !== "";

                    return (
                      <tr
                        key={district._id}
                        className={`hover:bg-gray-50 ${
                          isConfigured ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                isConfigured
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <FiMapPin size={16} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {district.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Code: {district.code} | Default:{" "}
                                {formatPrice(district.defaultDeliveryFee || 0)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              {currency?.symbol || "$"}
                            </span>
                            <input
                              type="number"
                              value={feeData.fee ?? ""}
                              onChange={(e) =>
                                updateLocalFee(
                                  district._id,
                                  "fee",
                                  e.target.value
                                )
                              }
                              className="w-full pl-7 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Not set"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative w-24">
                            <input
                              type="number"
                              value={
                                feeData.estimatedDays ??
                                district.defaultEstimatedDays ??
                                ""
                              }
                              onChange={(e) =>
                                updateLocalFee(
                                  district._id,
                                  "estimatedDays",
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : null
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Days"
                              min="1"
                              max="30"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() =>
                              updateLocalFee(
                                district._id,
                                "isAvailable",
                                feeData.isAvailable === false ? true : false
                              )
                            }
                            disabled={!isConfigured}
                            className={`p-2 rounded-lg transition-colors ${
                              !isConfigured
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                : feeData.isAvailable !== false
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                            title={
                              !isConfigured
                                ? "Set fee first"
                                : feeData.isAvailable !== false
                                ? "Click to disable"
                                : "Click to enable"
                            }
                          >
                            {feeData.isAvailable !== false ? (
                              <FiCheck size={18} />
                            ) : (
                              <FiX size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">How Delivery Works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Collect (Pickup):</strong> Customers pick up from your
                  store - no fee applies
                </li>
                <li>
                  <strong>Delivery:</strong> You deliver to the customer's
                  selected district
                </li>
                <li>
                  Set a fee for each district you can deliver to. Districts
                  without fees won't be selectable.
                </li>
                <li>
                  You are responsible for fulfilling all deliveries in this
                  phase.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDeliverySetup;
