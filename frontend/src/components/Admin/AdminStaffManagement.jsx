import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdEdit, MdDelete, MdPersonAdd } from "react-icons/md";
import {
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
} from "react-icons/hi";

const AdminStaffManagement = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SubAdmin",
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data } = await axios.get(`${server}/user/admin-staff`, {
        withCredentials: true,
      });
      setAdminUsers(data.adminUsers);
      setLoading(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch admin users"
      );
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/user/create-admin-user`,
        formData,
        { withCredentials: true }
      );
      toast.success(data.message);
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", role: "SubAdmin" });
      fetchAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${server}/user/update-admin-user/${selectedUser._id}`,
        { role: formData.role },
        { withCredentials: true }
      );
      toast.success(data.message);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }
    try {
      const { data } = await axios.delete(
        `${server}/user/delete-admin-user/${userId}`,
        { withCredentials: true }
      );
      toast.success(data.message);
      fetchAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, role: user.role });
    setShowEditModal(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <HiOutlineUserCircle className="text-blue-600" />;
      case "SubAdmin":
        return <HiOutlineShieldCheck className="text-green-600" />;
      case "Manager":
        return <HiOutlineBriefcase className="text-orange-600" />;
      default:
        return <HiOutlineUserCircle />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      Admin: "bg-blue-100 text-blue-800",
      SubAdmin: "bg-green-100 text-green-800",
      Manager: "bg-orange-100 text-orange-800",
    };
    return badges[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-3 sm:p-6">
      {/* Header - Stack on mobile, side by side on larger screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Admin Staff Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage SubAdmins and Managers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <MdPersonAdd size={20} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Role Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineShieldCheck className="text-green-600 flex-shrink-0" size={20} />
            <h3 className="font-semibold text-green-900 text-sm sm:text-base">SubAdmin Role</h3>
          </div>
          <p className="text-xs sm:text-sm text-green-700">
            Can approve vendors, products, ads, and moderate reviews. Has
            analytics access but no operational controls.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineBriefcase className="text-orange-600 flex-shrink-0" size={20} />
            <h3 className="font-semibold text-orange-900 text-sm sm:text-base">Manager Role</h3>
          </div>
          <p className="text-xs sm:text-sm text-orange-700">
            Has all operational controls (orders, products, coupons, categories,
            users). No access to Setup section.
          </p>
        </div>
      </div>

      {/* Staff List - Table for desktop, Cards for mobile */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adminUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {user.role !== "Admin" && (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <MdDelete size={20} />
                        </button>
                      </>
                    )}
                    {user.role === "Admin" && (
                      <span className="text-gray-400 text-xs">Protected</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {adminUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {getRoleIcon(user.role)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
              </div>
              {user.role !== "Admin" ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-xs flex-shrink-0">Protected</span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
              <span className="text-xs text-gray-500">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Add New Staff Member</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={visible ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {visible ? (
                        <AiOutlineEye size={20} />
                      ) : (
                        <AiOutlineEyeInvisible size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="SubAdmin">SubAdmin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "SubAdmin",
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Staff Member</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="SubAdmin">SubAdmin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffManagement;
