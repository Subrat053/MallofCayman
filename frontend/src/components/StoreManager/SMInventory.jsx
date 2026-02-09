import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { DataGrid } from "@material-ui/data-grid";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiSave,
  FiX,
} from "react-icons/fi";
import { MdSearch } from "react-icons/md";

const SMInventory = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("All");

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [updating, setUpdating] = useState(false);

  // Verify store manager access and fetch products
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

        // Fetch products for the shop
        const productsRes = await axios.get(
          `${server}/product/get-all-products-shop/${shopRes.data.shop._id}`,
          { withCredentials: true }
        );

        setProducts(productsRes.data?.products || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Unauthorized access");
          navigate("/");
        } else {
          toast.error("Failed to load inventory");
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

  // Filter products
  useEffect(() => {
    if (products) {
      let filtered = [...products];

      // Filter by stock level
      if (stockFilter === "Out of Stock") {
        filtered = filtered.filter((p) => p.stock <= 0);
      } else if (stockFilter === "Low Stock") {
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
      } else if (stockFilter === "In Stock") {
        filtered = filtered.filter((p) => p.stock > 10);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    }
  }, [products, stockFilter, searchTerm]);

  // Handle inline stock update
  const handleEditClick = (productId, currentStock) => {
    setEditingId(productId);
    setEditValue(currentStock.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveStock = async (productId) => {
    const newStock = parseInt(editValue);

    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock value");
      return;
    }

    try {
      setUpdating(true);

      // Create form data for stock update
      const formData = new FormData();
      formData.append("stock", newStock);

      // Update product stock via API - use correct endpoint
      await axios.put(
        `${server}/product/update-shop-product/${productId}`,
        formData,
        { withCredentials: true }
      );

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
      );

      toast.success("Stock updated successfully!");
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  // Get stock status style
  const getStockStyle = (stock) => {
    if (stock <= 0) {
      return { bg: "bg-red-100", text: "text-red-700", label: "Out of Stock" };
    } else if (stock <= 10) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Low Stock",
      };
    }
    return { bg: "bg-green-100", text: "text-green-700", label: "In Stock" };
  };

  const columns = [
    {
      field: "image",
      headerName: "Product",
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => (
        <img
          src={params.value}
          alt=""
          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div className="truncate">
          <p className="font-medium text-gray-800 truncate">{params.value}</p>
          <p className="text-xs text-gray-500">
            SKU: {params.row.sku || "N/A"}
          </p>
        </div>
      ),
    },
    {
      field: "stock",
      headerName: "Current Stock",
      minWidth: 160,
      flex: 0.8,
      renderCell: (params) => {
        const isEditing = editingId === params.row.id;

        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-20 px-2 py-1 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
              <button
                onClick={() => handleSaveStock(params.row.id)}
                disabled={updating}
                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                title="Save"
              >
                <FiSave size={14} />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updating}
                className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                title="Cancel"
              >
                <FiX size={14} />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-800">
              {params.value}
            </span>
            <button
              onClick={() => handleEditClick(params.row.id, params.value)}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Edit Stock"
            >
              <FiEdit3 size={14} />
            </button>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => {
        const { bg, text, label } = getStockStyle(params.row.stockValue);
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      field: "sold",
      headerName: "Sold",
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => (
        <span className="text-gray-600">{params.value || 0}</span>
      ),
    },
  ];

  const rows = filteredProducts.map((product) => ({
    id: product._id,
    image: product.images?.[0]?.url || "/placeholder.png",
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    stockValue: product.stock,
    sold: product.sold_out,
  }));

  // Calculate stats
  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Managing inventory for:{" "}
          <span className="font-medium text-blue-600">{shopData?.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiPackage className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.inStock}
              </p>
            </div>
            <FiCheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.lowStock}
              </p>
            </div>
            <FiAlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </p>
            </div>
            <FiXCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
              <p className="text-sm text-amber-700 mt-1">
                {stats.lowStock} product(s) have low stock (≤10 units). Consider
                restocking soon to avoid stockouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Out of Stock Warning */}
      {stats.outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Out of Stock!</h3>
              <p className="text-sm text-red-700 mt-1">
                {stats.outOfStock} product(s) are completely out of stock and
                cannot be purchased by customers.
              </p>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock (&gt;10)</option>
            <option value="Low Stock">Low Stock (1-10)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <FiEdit3 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Quick Stock Update</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click the edit icon next to any stock value to update it directly.
              Changes are saved immediately.
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

export default SMInventory;
