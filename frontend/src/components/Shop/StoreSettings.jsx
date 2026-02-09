import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiCreditCard,
  FiSearch,
  FiFileText,
  FiBell,
  FiSave,
  FiShield,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const StoreSettings = () => {
  const [activeTab, setActiveTab] = useState("payment");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
    },
    payment: {
      acceptCOD: true,
      acceptOnlinePayment: true,
      minimumOrderAmount: 0,
      freeShippingThreshold: 0,
    },
    policies: {
      returnPolicy: "",
      shippingPolicy: "",
      privacyPolicy: "",
      termsOfService: "",
    },
    notifications: {
      emailOnNewOrder: true,
      emailOnOrderStatus: true,
      emailOnNewReview: true,
      emailOnLowStock: false,
      lowStockThreshold: 5,
    },
  });

  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/shop/get-store-settings`, {
        withCredentials: true,
      });

      if (data.success) {
        if (data.storeSettings) {
          setSettings((prev) => ({
            ...prev,
            ...data.storeSettings,
          }));
        }
        setPaypalEmail(data.paypalEmail || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/shop/update-store-settings`,
        {
          storeSettings: settings,
          paypalEmail,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Settings saved successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: "payment", label: "Payment", icon: FiCreditCard },
    { id: "seo", label: "SEO", icon: FiSearch },
    { id: "policies", label: "Policies", icon: FiFileText },
    { id: "notifications", label: "Notifications", icon: FiBell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your store preferences, payment options, and policies
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Payment Settings */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiCreditCard className="text-blue-600" />
              Payment Settings
            </h2>

            {/* PayPal Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                  alt="PayPal"
                  className="h-5"
                />
                PayPal Business Settings
              </h3>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">
                      PayPal Business Account Required
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      To receive payments, you must use a{" "}
                      <strong>PayPal Business account email</strong>. Personal
                      PayPal accounts cannot receive commercial payments.
                    </p>
                    <a
                      href="https://www.paypal.com/business/getting-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                    >
                      <span>Learn how to upgrade to PayPal Business</span>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Business Email
                </label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-business@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the email associated with your PayPal Business account
                  to receive payouts
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiSearch className="text-green-600" />
              SEO Settings
            </h2>
            <p className="text-sm text-gray-500">
              Optimize your store for search engines to improve visibility and
              attract more customers.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title{" "}
                  <span className="text-gray-400">(max 70 characters)</span>
                </label>
                <input
                  type="text"
                  maxLength={70}
                  value={settings.seo.metaTitle}
                  onChange={(e) =>
                    updateSettings("seo", "metaTitle", e.target.value)
                  }
                  placeholder="Your Store Name - Best Products Online"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.seo.metaTitle.length}/70 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description{" "}
                  <span className="text-gray-400">(max 160 characters)</span>
                </label>
                <textarea
                  maxLength={160}
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    updateSettings("seo", "metaDescription", e.target.value)
                  }
                  placeholder="A brief description of your store that appears in search results..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.seo.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords{" "}
                  <span className="text-gray-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={settings.seo.metaKeywords}
                  onChange={(e) =>
                    updateSettings("seo", "metaKeywords", e.target.value)
                  }
                  placeholder="online store, products, shopping, deals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Share Image URL (OG Image)
                </label>
                <input
                  type="url"
                  value={settings.seo.ogImage}
                  onChange={(e) =>
                    updateSettings("seo", "ogImage", e.target.value)
                  }
                  placeholder="https://example.com/store-image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This image appears when your store is shared on social media
                  (recommended: 1200x630px)
                </p>
              </div>
            </div>

            {/* SEO Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Search Preview
              </h3>
              <div className="bg-white p-3 rounded border">
                <p className="text-blue-700 text-lg hover:underline cursor-pointer">
                  {settings.seo.metaTitle || "Your Store Name"}
                </p>
                <p className="text-green-700 text-sm">www.yourstore.com</p>
                <p className="text-gray-600 text-sm">
                  {settings.seo.metaDescription ||
                    "Your store description will appear here..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Policies */}
        {activeTab === "policies" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiShield className="text-purple-600" />
              Store Policies
            </h2>
            <p className="text-sm text-gray-500">
              Define your store policies to build trust with customers. These
              will be displayed on your store page.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return & Refund Policy
                </label>
                <textarea
                  rows={4}
                  value={settings.policies.returnPolicy}
                  onChange={(e) =>
                    updateSettings("policies", "returnPolicy", e.target.value)
                  }
                  placeholder="Describe your return and refund policy..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Policy
                </label>
                <textarea
                  rows={4}
                  value={settings.policies.shippingPolicy}
                  onChange={(e) =>
                    updateSettings("policies", "shippingPolicy", e.target.value)
                  }
                  placeholder="Describe your shipping methods, delivery times, and costs..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy Policy
                </label>
                <textarea
                  rows={4}
                  value={settings.policies.privacyPolicy}
                  onChange={(e) =>
                    updateSettings("policies", "privacyPolicy", e.target.value)
                  }
                  placeholder="Describe how you handle customer data..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms of Service
                </label>
                <textarea
                  rows={4}
                  value={settings.policies.termsOfService}
                  onChange={(e) =>
                    updateSettings("policies", "termsOfService", e.target.value)
                  }
                  placeholder="Define the terms and conditions for using your store..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiBell className="text-yellow-600" />
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-500">
              Choose which email notifications you want to receive for your
              store.
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    New Order Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive email when a new order is placed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnNewOrder}
                  onChange={(e) =>
                    updateSettings(
                      "notifications",
                      "emailOnNewOrder",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    Order Status Updates
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive email when order status changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnOrderStatus}
                  onChange={(e) =>
                    updateSettings(
                      "notifications",
                      "emailOnOrderStatus",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">New Review Alerts</p>
                  <p className="text-sm text-gray-500">
                    Receive email when customer leaves a review
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnNewReview}
                  onChange={(e) =>
                    updateSettings(
                      "notifications",
                      "emailOnNewReview",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">
                      Low Stock Alerts
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive email when product stock is low
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailOnLowStock}
                    onChange={(e) =>
                      updateSettings(
                        "notifications",
                        "emailOnLowStock",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                {settings.notifications.emailOnLowStock && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.notifications.lowStockThreshold}
                      onChange={(e) =>
                        updateSettings(
                          "notifications",
                          "lowStockThreshold",
                          Number(e.target.value)
                        )
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alert when stock falls below this number
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
