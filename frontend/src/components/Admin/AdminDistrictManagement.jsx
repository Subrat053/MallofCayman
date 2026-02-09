import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiMove,
  FiSettings,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import { useCurrency } from "../../context/CurrencyContext";

const AdminDistrictManagement = () => {
  const { formatPrice, currency } = useCurrency();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    defaultDeliveryFee: 0,
    defaultEstimatedDays: 3,
    isActive: true,
    sortOrder: 0,
  });

  // Load districts
  const loadDistricts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/district/admin/all`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setDistricts(response.data.districts);
      }
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      defaultDeliveryFee: 0,
      defaultEstimatedDays: 3,
      isActive: true,
      sortOrder: districts.length,
    });
    setEditingDistrict(null);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (district) => {
    setFormData({
      name: district.name,
      code: district.code,
      description: district.description || "",
      defaultDeliveryFee: district.defaultDeliveryFee || 0,
      defaultEstimatedDays: district.defaultEstimatedDays || 3,
      isActive: district.isActive,
      sortOrder: district.sortOrder || 0,
    });
    setEditingDistrict(district);
    setShowAddModal(true);
  };

  // Create district
  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error("District name and code are required");
      return;
    }

    try {
      setSaveLoading(true);
      const response = await axios.post(`${server}/district/create`, formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("District created successfully");
        setShowAddModal(false);
        resetForm();
        loadDistricts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create district");
    } finally {
      setSaveLoading(false);
    }
  };

  // Update district
  const handleUpdate = async () => {
    if (!editingDistrict) return;

    try {
      setSaveLoading(true);
      const response = await axios.put(
        `${server}/district/update/${editingDistrict._id}`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("District updated successfully");
        setShowAddModal(false);
        resetForm();
        loadDistricts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update district");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete (deactivate) district
  const handleDelete = async (districtId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this district? It will no longer be available for new orders but will remain visible in historical orders."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${server}/district/delete/${districtId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("District deactivated successfully");
        loadDistricts();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate district"
      );
    }
  };

  // Seed Cayman Islands districts
  const handleSeedCayman = async () => {
    if (
      !window.confirm(
        "This will add default Cayman Islands districts. Continue?"
      )
    ) {
      return;
    }

    try {
      setSaveLoading(true);
      const response = await axios.post(
        `${server}/district/seed-cayman`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        loadDistricts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to seed districts");
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle district status
  const toggleDistrictStatus = async (district) => {
    try {
      const response = await axios.put(
        `${server}/district/update/${district._id}`,
        { isActive: !district.isActive },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(
          `District ${district.isActive ? "deactivated" : "activated"}`
        );
        loadDistricts();
      }
    } catch (error) {
      toast.error("Failed to update district status");
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FiMapPin className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  District Management
                </h1>
                <p className="text-gray-600">
                  Manage delivery zones for Mall of Cayman
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSeedCayman}
                disabled={saveLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FiRefreshCw size={16} />
                <span>Seed Cayman Districts</span>
              </button>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiPlus size={16} />
                <span>Add District</span>
              </button>
            </div>
          </div>
        </div>

        {/* Districts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Days
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {districts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <FiMapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No Districts Found</p>
                      <p className="text-sm">
                        Click "Seed Cayman Districts" to add default districts
                      </p>
                    </td>
                  </tr>
                ) : (
                  districts.map((district, index) => (
                    <tr key={district._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-400">
                          <FiMove className="mr-2" />
                          <span>{district.sortOrder || index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <FiMapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {district.name}
                            </div>
                            {district.description && (
                              <div className="text-sm text-gray-500">
                                {district.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-mono rounded">
                          {district.code}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900">
                          <FiDollarSign className="w-4 h-4 text-green-500 mr-1" />
                          {formatPrice(district.defaultDeliveryFee || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-600">
                          <FiClock className="w-4 h-4 mr-1" />
                          {district.defaultEstimatedDays || 3} days
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleDistrictStatus(district)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            district.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {district.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(district)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(district._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiMapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Districts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {districts.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Districts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {districts.filter((d) => d.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Inactive Districts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {districts.filter((d) => !d.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDistrict ? "Edit District" : "Add New District"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., George Town"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g., GT"
                  maxLength={5}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Capital district"
                />
              </div>

              {/* Default Delivery Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Delivery Fee ({currency?.symbol || "$"})
                </label>
                <input
                  type="number"
                  name="defaultDeliveryFee"
                  value={formData.defaultDeliveryFee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Estimated Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Days
                </label>
                <input
                  type="number"
                  name="defaultEstimatedDays"
                  value={formData.defaultEstimatedDays}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  District is active and available for delivery
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingDistrict ? handleUpdate : handleCreate}
                disabled={saveLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    <span>{editingDistrict ? "Update" : "Create"}</span>
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

export default AdminDistrictManagement;
