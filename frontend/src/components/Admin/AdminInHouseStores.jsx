import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { FiSearch, FiCheck, FiX, FiEdit2, FiSave } from "react-icons/fi";
import { MdStorefront, MdOutlineCampaign, MdVerified } from "react-icons/md";
import { BsShop, BsGift } from "react-icons/bs";

const AdminInHouseStores = () => {
  const [shops, setShops] = useState([]);
  const [exemptShops, setExemptShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [formData, setFormData] = useState({
    adFeeExempt: false,
    adFeeExemptReason: "",
    isInHouseStore: false,
    inHouseStoreNote: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchShops();
    fetchExemptShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
        withCredentials: true,
      });
      if (data.success) {
        setShops(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const fetchExemptShops = async () => {
    try {
      const { data } = await axios.get(
        `${server}/shop/admin/ad-fee-exempt-shops`,
        {
          withCredentials: true,
        },
      );
      if (data.success) {
        setExemptShops(data.shops || []);
      }
    } catch (error) {
      console.error("Error fetching exempt shops:", error);
    }
  };

  const openEditModal = async (shop) => {
    try {
      // Fetch current ad status for this shop
      const { data } = await axios.get(
        `${server}/shop/admin/shop-ad-status/${shop._id}`,
        {
          withCredentials: true,
        },
      );

      if (data.success) {
        setSelectedShop(data.shop);
        setFormData({
          adFeeExempt: data.shop.adFeeExempt || false,
          adFeeExemptReason: data.shop.adFeeExemptReason || "",
          isInHouseStore: data.shop.isInHouseStore || false,
          inHouseStoreNote: data.shop.inHouseStoreNote || "",
        });
      } else {
        setSelectedShop(shop);
        setFormData({
          adFeeExempt: shop.adFeeExempt || false,
          adFeeExemptReason: shop.adFeeExemptReason || "",
          isInHouseStore: shop.isInHouseStore || false,
          inHouseStoreNote: shop.inHouseStoreNote || "",
        });
      }
      setShowModal(true);
    } catch (error) {
      // If endpoint doesn't exist yet, use the basic shop info
      setSelectedShop(shop);
      setFormData({
        adFeeExempt: shop.adFeeExempt || false,
        adFeeExemptReason: shop.adFeeExemptReason || "",
        isInHouseStore: shop.isInHouseStore || false,
        inHouseStoreNote: shop.inHouseStoreNote || "",
      });
      setShowModal(true);
    }
  };

  const handleSave = async () => {
    if (!selectedShop) return;

    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/shop/admin/toggle-ad-fee-exempt/${selectedShop._id}`,
        formData,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        fetchShops();
        fetchExemptShops();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update shop");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (shop, exempt) => {
    try {
      const { data } = await axios.put(
        `${server}/shop/admin/toggle-ad-fee-exempt/${shop._id}`,
        {
          adFeeExempt: exempt,
          adFeeExemptReason: exempt ? "Admin granted exemption" : "",
        },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        fetchShops();
        fetchExemptShops();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update shop");
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {params.row.avatar?.url ? (
            <img
              src={params.row.avatar.url}
              alt={params.row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <BsShop className="text-gray-400" size={20} />
          )}
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{params.row.name}</span>
          {params.row.isInHouseStore && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              IN-HOUSE
            </span>
          )}
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "adFeeExempt",
      headerName: "Ad Fee Exempt",
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center">
          {params.row.adFeeExempt ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <MdVerified size={14} />
              EXEMPT
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              Standard
            </span>
          )}
        </div>
      ),
    },
    {
      field: "reason",
      headerName: "Exemption Reason",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <span className="text-sm text-gray-600 truncate">
          {params.row.adFeeExemptReason || "-"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            onClick={() => openEditModal(params.row)}
            className="!min-w-0 !px-3 !py-1.5 !bg-blue-500 !text-white !text-xs"
            title="Edit Settings"
          >
            <FiEdit2 size={14} className="mr-1" /> Edit
          </Button>
          {params.row.adFeeExempt ? (
            <Button
              size="small"
              onClick={() => handleQuickToggle(params.row, false)}
              className="!min-w-0 !px-3 !py-1.5 !bg-red-100 !text-red-700 !text-xs"
              title="Remove Exemption"
            >
              <FiX size={14} className="mr-1" /> Remove
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => handleQuickToggle(params.row, true)}
              className="!min-w-0 !px-3 !py-1.5 !bg-green-100 !text-green-700 !text-xs"
              title="Grant Exemption"
            >
              <FiCheck size={14} className="mr-1" /> Grant
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows = filteredShops.map((shop) => ({
    id: shop._id,
    _id: shop._id,
    avatar: shop.avatar,
    name: shop.name,
    email: shop.email,
    adFeeExempt: shop.adFeeExempt,
    adFeeExemptReason: shop.adFeeExemptReason,
    isInHouseStore: shop.isInHouseStore,
    inHouseStoreNote: shop.inHouseStoreNote,
  }));

  return (
    <div className="w-full mx-2 sm:mx-4 800px:mx-8 pt-1 mt-4 sm:mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MdStorefront className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                In-House Stores & Ad Fee Exemptions
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Manage stores that can advertise without fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 border-b">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <MdStorefront className="text-purple-600" size={20} />
            <span className="text-sm text-gray-600">Total Shops</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {shops.length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <BsGift className="text-green-600" size={20} />
            <span className="text-sm text-gray-600">Ad Fee Exempt</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {exemptShops.length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <MdOutlineCampaign className="text-indigo-600" size={20} />
            <span className="text-sm text-gray-600">In-House Stores</span>
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {shops.filter((s) => s.isInHouseStore).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <MdVerified className="text-blue-600" size={20} />
            <span className="text-sm text-gray-600">Standard Shops</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {shops.length - exemptShops.length}
          </div>
        </div>
      </div>

      {/* Currently Exempt Shops */}
      {exemptShops.length > 0 && (
        <div className="p-4 sm:p-6 border-b bg-green-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BsGift className="text-green-600" />
            Currently Exempt Stores ({exemptShops.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {exemptShops.map((shop) => (
              <div
                key={shop._id}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  {shop.avatar?.url ? (
                    <img
                      src={shop.avatar.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BsShop className="text-gray-400" size={14} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {shop.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {shop.isInHouseStore
                      ? "In-House"
                      : shop.adFeeExemptReason || "Exempt"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="p-4 sm:p-6 border-b">
        <div className="relative max-w-md">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shops by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="p-4 sm:p-6">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          autoHeight
          loading={loading}
        />
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-6 bg-blue-50 border-t">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <MdOutlineCampaign size={20} />
          About Ad Fee Exemptions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-700">
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>In-House Stores:</strong> Platform-owned stores like
              "Amazing Fines"
            </li>
            <li>
              <strong>Ad Fee Exempt:</strong> Can create ads without payment
            </li>
            <li>Exempt stores' ads are auto-approved</li>
          </ul>
          <ul className="space-y-2 list-disc list-inside">
            <li>Store managers of exempt stores also get free ads</li>
            <li>Use this for promotional partnerships too</li>
            <li>Exemptions can be removed at any time</li>
          </ul>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdStorefront className="text-purple-600" />
              Edit Store Settings
            </h3>

            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {selectedShop.avatar?.url ? (
                    <img
                      src={selectedShop.avatar.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BsShop className="text-gray-400" size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {selectedShop.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedShop.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* In-House Store Toggle */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <div className="font-semibold text-gray-800">
                    In-House Store
                  </div>
                  <div className="text-sm text-gray-600">
                    Mark as platform-owned store
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isInHouseStore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isInHouseStore: e.target.checked,
                        adFeeExempt: e.target.checked
                          ? true
                          : formData.adFeeExempt,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {formData.isInHouseStore && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    In-House Store Note
                  </label>
                  <input
                    type="text"
                    value={formData.inHouseStoreNote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inHouseStoreNote: e.target.value,
                      })
                    }
                    placeholder="e.g., Amazing Fines - Platform Store"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Ad Fee Exempt Toggle */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-gray-800">
                    Ad Fee Exempt
                  </div>
                  <div className="text-sm text-gray-600">
                    Allow free advertising
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.adFeeExempt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adFeeExempt: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                    disabled={formData.isInHouseStore}
                  />
                  <div
                    className={`w-11 h-6 ${formData.isInHouseStore ? "bg-green-500 cursor-not-allowed" : "bg-gray-300"} peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600`}
                  ></div>
                </label>
              </div>
              {formData.isInHouseStore && (
                <p className="text-xs text-green-600 -mt-2 ml-2">
                  ✓ In-house stores are automatically ad fee exempt
                </p>
              )}

              {formData.adFeeExempt && !formData.isInHouseStore && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exemption Reason
                  </label>
                  <input
                    type="text"
                    value={formData.adFeeExemptReason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adFeeExemptReason: e.target.value,
                      })
                    }
                    placeholder="e.g., Special Partner, Promotional Agreement"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInHouseStores;
