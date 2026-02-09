import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllSellers } from "../../redux/actions/sellers";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiUserX,
  FiUserCheck,
  FiClock,
  FiDownload,
  FiFileText,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { HiOutlineUserGroup, HiOutlineDocumentText } from "react-icons/hi";
import { MdStorefront, MdVerified, MdOutlineDescription } from "react-icons/md";
import Loader from "../Layout/Loader";

const PendingSellers = () => {
  const dispatch = useDispatch();
  const { sellers, loading } = useSelector((state) => state.seller);
  const [searchTerm, setSearchTerm] = useState("");

  // Approval/rejection states
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View details state
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingSeller, setViewingSeller] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // "info", "documents", "bank"

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  // Approval handler function
  const handleApproveSeller = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${server}/shop/admin-approve-seller/${selectedSeller._id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Seller approved successfully");
        setApprovalModalOpen(false);
        setSelectedSeller(null);
        dispatch(getAllSellers());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rejection handler function
  const handleRejectSeller = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${server}/shop/admin-reject-seller/${selectedSeller._id}`,
        { rejectionReason: rejectionReason.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Seller rejected successfully");
        setRejectionModalOpen(false);
        setRejectionReason("");
        setSelectedSeller(null);
        dispatch(getAllSellers());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  // View seller details handler
  const handleViewDetails = (sellerId) => {
    const seller = sellers?.find((s) => s._id === sellerId);
    if (seller) {
      setViewingSeller(seller);
      setActiveTab("info");
      setViewDetailsModalOpen(true);
    }
  };

  // Check if file is PDF
  const isPDF = (url) => {
    if (!url) return false;
    return (
      url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/pdf")
    );
  };

  // Get file name from URL
  const getFileName = (license) => {
    if (license.originalName) return license.originalName;
    const urlParts = license.url.split("/");
    return urlParts[urlParts.length - 1];
  };

  const columns = [
    {
      field: "id",
      headerName: "Seller ID",
      minWidth: 180,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div
          className="text-xs font-mono text-primary-600 truncate"
          title={params.value}
        >
          #{params.value.slice(0, 8)}
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 200,
      flex: 1.2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MdStorefront className="text-white text-sm" />
          </div>
          <span
            className="font-medium text-gray-900 truncate"
            title={params.value}
          >
            {params.value || "N/A"}
          </span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 220,
      flex: 1.2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <span className="text-gray-600 truncate" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      minWidth: 180,
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <span className="text-gray-600 truncate" title={params.value}>
          {params.value || "Not provided"}
        </span>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      minWidth: 130,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value || "N/A"}</span>
      ),
    },
    {
      field: "registeredAt",
      headerName: "Registration Date",
      minWidth: 130,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 220,
      flex: 1.4,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-1">
          <Button
            onClick={() => handleViewDetails(params.id)}
            className="!min-w-0 !p-2 !text-blue-600 hover:!bg-blue-50 !rounded-lg transition-all duration-200"
            title="View Details"
          >
            <HiOutlineDocumentText size={16} />
          </Button>

          <Link to={`/shop/preview/${params.id}`}>
            <Button
              className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
              title="Preview Shop"
            >
              <FiEye size={16} />
            </Button>
          </Link>

          <Button
            onClick={() => {
              setSelectedSeller(params.row);
              setApprovalModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg transition-all duration-200"
            title="Approve Seller"
          >
            <FiUserCheck size={16} />
          </Button>

          <Button
            onClick={() => {
              setSelectedSeller(params.row);
              setRejectionModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg transition-all duration-200"
            title="Reject Seller"
          >
            <FiUserX size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Filter only pending sellers
  const pendingSellers =
    sellers?.filter((seller) => seller.approvalStatus === "pending") || [];

  const row = [];
  pendingSellers.forEach((item) => {
    row.push({
      id: item._id,
      name: item?.name,
      email: item?.email,
      registeredAt: item.createdAt?.slice(0, 10) || "N/A",
      address: item.address,
      phoneNumber: item.phoneNumber,
      approvalStatus: item.approvalStatus || "pending",
      _id: item._id, // Add full item for reference
    });
  });

  // Filter sellers based on search term
  const filteredRows = row.filter((seller) => {
    const matchesSearch =
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.address?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <FiClock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
              Pending Sellers
            </h1>
            <p className="text-gray-600">
              Review and approve seller applications
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-3 gap-4 800px:gap-6 mb-6">
        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Applications
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingSellers.length}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Awaiting Review
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-blue-600">
                {sellers?.length || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  All Status
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiOutlineUserGroup className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Approved Sellers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {sellers?.filter((s) => s.approvalStatus === "approved")
                  .length || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdVerified className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${styles.card} p-4 mb-6`}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search pending sellers by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Pending Sellers Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Applications
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredRows.length} seller
                  {filteredRows.length !== 1 ? "s" : ""} awaiting approval
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/admin-sellers"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Sellers →
              </Link>
            </div>
          </div>
        </div>

        <div className="h-[600px] w-full">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight={false}
            className="!border-0"
            sx={{
              "& .MuiDataGrid-main": {
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#fffbeb",
                  borderBottom: "1px solid #fed7aa",
                  "& .MuiDataGrid-columnHeader": {
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#92400e",
                    padding: "12px",
                  },
                },
                "& .MuiDataGrid-cell": {
                  padding: "12px",
                  borderBottom: "1px solid #fef3c7",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#fffbeb",
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #fed7aa",
                backgroundColor: "#fffbeb",
              },
            }}
          />
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Approve Seller
              </h3>
              <button
                onClick={() => {
                  setApprovalModalOpen(false);
                  setSelectedSeller(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUserCheck className="text-green-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to approve{" "}
                <strong>{selectedSeller.name}</strong>? This will allow them to
                access their seller dashboard and start selling on the platform.
              </p>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Shop Details:
                </p>
                <p className="text-sm text-gray-600">
                  Name: {selectedSeller.name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedSeller.email}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {selectedSeller.address}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedSeller.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setApprovalModalOpen(false);
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveSeller}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Approving..." : "Approve Seller"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Seller
              </h3>
              <button
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason("");
                  setSelectedSeller(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUserX className="text-red-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to reject{" "}
                <strong>{selectedSeller.name}</strong>? This will prevent them
                from accessing their seller dashboard.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Shop Details:
                </p>
                <p className="text-sm text-gray-600">
                  Name: {selectedSeller.name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedSeller.email}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {selectedSeller.address}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedSeller.phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this seller application..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason("");
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSeller}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Rejecting..." : "Reject Seller"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModalOpen && viewingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-unacademy-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center overflow-hidden">
                  {viewingSeller.avatar?.url ? (
                    <img
                      src={viewingSeller.avatar.url}
                      alt={viewingSeller.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MdStorefront className="text-white text-2xl" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingSeller.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Applied on{" "}
                    {new Date(viewingSeller.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewDetailsModalOpen(false);
                  setViewingSeller(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <RxCross1 size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "info"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MdOutlineDescription size={18} />
                  Basic Info
                </span>
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "documents"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiFileText size={18} />
                  Documents
                  {viewingSeller.tradeLicenses?.length > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                      {viewingSeller.tradeLicenses.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "bank"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiCreditCard size={18} />
                  Payment Info
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Basic Info Tab */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiMail className="text-orange-500" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Email Address
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiMapPin className="text-orange-500" />
                      Address Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Full Address
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.address || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Zip Code</p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.zipCode || "Not provided"}
                        </p>
                      </div>
                      {viewingSeller.latitude && viewingSeller.longitude && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Coordinates
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.latitude}, {viewingSeller.longitude}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MdStorefront className="text-orange-500" />
                      Business Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">GST Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.gstNumber || "Not provided"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.description || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Subscription Plan
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            viewingSeller.subscriptionPlan === "gold"
                              ? "bg-yellow-100 text-yellow-800"
                              : viewingSeller.subscriptionPlan === "silver"
                              ? "bg-gray-100 text-gray-800"
                              : viewingSeller.subscriptionPlan === "bronze"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {viewingSeller.subscriptionPlan || "Free"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  {/* Trade Licenses */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiFileText className="text-orange-500" />
                      Trade & Business License Documents
                    </h4>

                    {viewingSeller.tradeLicenses &&
                    viewingSeller.tradeLicenses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viewingSeller.tradeLicenses.map((license, index) => (
                          <div
                            key={license.public_id || index}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                          >
                            {/* Document Preview */}
                            <div className="relative aspect-[4/3] bg-gray-100">
                              {isPDF(license.url) ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                                  <FiFileText className="text-red-500 text-4xl mb-2" />
                                  <span className="text-xs text-gray-600">
                                    PDF Document
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={license.url}
                                  alt={`Trade License ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() =>
                                    window.open(license.url, "_blank")
                                  }
                                />
                              )}
                            </div>

                            {/* Document Info */}
                            <div className="p-3">
                              <p
                                className="text-sm font-medium text-gray-900 truncate"
                                title={getFileName(license)}
                              >
                                {getFileName(license)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded:{" "}
                                {license.uploadedAt
                                  ? new Date(
                                      license.uploadedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <a
                                  href={license.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded text-xs font-medium hover:bg-orange-200 transition-colors"
                                >
                                  <FiEye size={14} />
                                  View
                                </a>
                                <a
                                  href={license.url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                  <FiDownload size={14} />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiFileText className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          No trade license documents uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shop Avatar */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MdStorefront className="text-orange-500" />
                      Shop Logo/Avatar
                    </h4>

                    {viewingSeller.avatar?.url ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={viewingSeller.avatar.url}
                          alt="Shop Avatar"
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <a
                            href={viewingSeller.avatar.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded text-sm font-medium hover:bg-orange-200 transition-colors"
                          >
                            <FiEye size={14} />
                            View Full Size
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No shop avatar uploaded</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info Tab */}
              {activeTab === "bank" && (
                <div className="space-y-6">
                  {/* PayPal Information */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiDollarSign className="text-orange-500" />
                      PayPal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          PayPal Email
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingSeller.paypalEmail || "Not provided"}
                        </p>
                      </div>
                      {viewingSeller.paypalMerchantId && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            PayPal Merchant ID
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.paypalMerchantId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiCreditCard className="text-orange-500" />
                      Bank Account Details
                    </h4>

                    {viewingSeller.bankAccountDetails &&
                    (viewingSeller.bankAccountDetails.accountNumber ||
                      viewingSeller.bankAccountDetails.bankName) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Holder Name
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.bankAccountDetails
                              .accountHolderName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Bank Name
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.bankAccountDetails.bankName ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Number
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.bankAccountDetails.accountNumber ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            IFSC Code
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {viewingSeller.bankAccountDetails.ifscCode ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Account Type
                          </p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {viewingSeller.bankAccountDetails.accountType ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No bank account details provided
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <Link
                to={`/shop/preview/${viewingSeller._id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Shop Page →
              </Link>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setViewDetailsModalOpen(false);
                    setViewingSeller(null);
                    setSelectedSeller({
                      _id: viewingSeller._id,
                      name: viewingSeller.name,
                      email: viewingSeller.email,
                      address: viewingSeller.address,
                      phoneNumber: viewingSeller.phoneNumber,
                    });
                    setRejectionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <FiUserX size={16} />
                  Reject
                </button>
                <button
                  onClick={() => {
                    setViewDetailsModalOpen(false);
                    setViewingSeller(null);
                    setSelectedSeller({
                      _id: viewingSeller._id,
                      name: viewingSeller.name,
                      email: viewingSeller.email,
                      address: viewingSeller.address,
                      phoneNumber: viewingSeller.phoneNumber,
                    });
                    setApprovalModalOpen(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <FiUserCheck size={16} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSellers;
