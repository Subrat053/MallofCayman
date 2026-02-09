import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { DataGrid } from "@material-ui/data-grid";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";
import { AiOutlineEye } from "react-icons/ai";
import {
  FiDownload,
  FiLoader,
  FiPackage,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { MdSearch } from "react-icons/md";

// Helper function to get order number for display
const getOrderNumber = (order) => {
  return (
    order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`
  );
};

const SMOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [downloadingInvoices, setDownloadingInvoices] = useState({});

  // Verify store manager access and fetch orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get managed shop
        const shopRes = await axios.get(
          `${server}/store-manager/my-managed-shop`,
          { withCredentials: true }
        );

        if (!shopRes.data.success || !shopRes.data.shop) {
          toast.error("You are not assigned as a store manager");
          navigate("/");
          return;
        }

        setShopData(shopRes.data.shop);

        // Fetch orders for the shop
        const ordersRes = await axios.get(
          `${server}/order/get-seller-all-orders/${shopRes.data.shop._id}`,
          { withCredentials: true }
        );

        setOrders(ordersRes.data?.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Unauthorized access");
          navigate("/");
        } else {
          toast.error("Failed to load orders");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "store_manager") {
      fetchData();
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  // Filter orders
  useEffect(() => {
    if (orders) {
      let filtered = [...orders];

      // Filter by status
      if (statusFilter !== "All") {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((order) => {
          const orderNum = getOrderNumber(order).toLowerCase();
          const customerName = order.user?.name?.toLowerCase() || "";
          return (
            orderNum.includes(searchTerm.toLowerCase()) ||
            customerName.includes(searchTerm.toLowerCase())
          );
        });
      }

      setFilteredOrders(filtered);
    }
  }, [orders, statusFilter, searchTerm]);

  // Handle invoice download
  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoices((prev) => ({ ...prev, [orderId]: true }));

      const response = await axios.get(
        `${server}/order/seller-invoice-pdf/${orderId}`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoices((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  // Get status style
  const getStatusStyle = (status) => {
    const styles = {
      Processing: "bg-yellow-100 text-yellow-700",
      "Transferred to delivery partner": "bg-blue-100 text-blue-700",
      Shipping: "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      "Processing refund": "bg-orange-100 text-orange-700",
      "Refund Success": "bg-gray-100 text-gray-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const columns = [
    {
      field: "orderNumber",
      headerName: "Order #",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-mono font-bold text-blue-600 text-sm">
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
            params.value
          )}`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items",
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => (
        <div className="flex items-center">
          <FiPackage className="text-gray-400 mr-1" size={14} />
          <span className="font-medium text-gray-700">{params.value}</span>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-bold text-green-600">{params.value}</span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      minWidth: 110,
      flex: 0.6,
      renderCell: (params) => (
        <div className="flex items-center text-gray-500 text-sm">
          <FiClock className="mr-1" size={12} />
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 130,
      flex: 0.6,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-1">
          <Link to={`/store-manager/order/${params.id}`}>
            <button
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="View Order"
            >
              <AiOutlineEye size={16} />
            </button>
          </Link>
          <button
            onClick={() => handleDownloadInvoice(params.id)}
            disabled={downloadingInvoices[params.id]}
            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            title="Download Invoice"
          >
            {downloadingInvoices[params.id] ? (
              <FiLoader className="animate-spin" size={16} />
            ) : (
              <FiDownload size={16} />
            )}
          </button>
        </div>
      ),
    },
  ];

  const rows = filteredOrders.map((order) => ({
    id: order._id,
    orderNumber: getOrderNumber(order),
    status: order.status,
    itemsQty: order.cart?.reduce((acc, item) => acc + item.qty, 0) || 0,
    total: formatPrice(order.totalPrice),
    createdAt: new Date(order.createdAt).toLocaleDateString(),
  }));

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Processing").length,
    shipping: orders.filter(
      (o) =>
        o.status === "Transferred to delivery partner" ||
        o.status === "Shipping"
    ).length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Managing orders for:{" "}
          <span className="font-medium text-blue-600">{shopData?.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <FiClock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipping</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.shipping}
              </p>
            </div>
            <FiPackage className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.delivered}
              </p>
            </div>
            <FiCheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="All">All Status</option>
            <option value="Processing">Processing</option>
            <option value="Transferred to delivery partner">Transferred</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Important Notice for Store Manager */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <FiClock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">
              Payment Confirmation Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Before fulfilling orders, please confirm with the store owner that
              payment has been received. As Store Manager, you coordinate
              fulfillment but payments go directly to the store owner.
            </p>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          className="border-0"
        />
      </div>
    </div>
  );
};

export default SMOrders;
