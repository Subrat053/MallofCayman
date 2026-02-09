import React, { useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineEdit,
} from "react-icons/ai";
import { FiPackage, FiAlertTriangle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import { DataGrid } from "@material-ui/data-grid";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";

const SMProducts = () => {
  const { user } = useSelector((state) => state.user);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");

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
        console.error("Error fetching products:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Unauthorized access");
          navigate("/");
        } else {
          toast.error("Failed to load products");
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${server}/product/delete-shop-product/${id}`, {
          withCredentials: true,
        });
        toast.success("Product deleted successfully");
        setProducts(products.filter((p) => p._id !== id));
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete product"
        );
      }
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Product ID",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className="text-gray-600 text-xs font-mono">
          #{params.value.slice(-6)}
        </span>
      ),
    },
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-1">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiPackage className="text-blue-600" size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 truncate text-sm">
              {params.value}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-bold text-green-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      minWidth: 80,
      flex: 0.4,
      renderCell: (params) => {
        const isLow = params.value <= 5;
        return (
          <div className="flex items-center">
            {isLow && (
              <FiAlertTriangle className="text-amber-500 mr-1" size={14} />
            )}
            <span
              className={`font-bold ${
                isLow ? "text-amber-600" : "text-gray-700"
              } text-sm`}
            >
              {params.value}
            </span>
          </div>
        );
      },
    },
    {
      field: "sold",
      headerName: "Sold",
      minWidth: 70,
      flex: 0.4,
      renderCell: (params) => (
        <span className="text-purple-600 font-semibold text-sm">
          {params.value}
        </span>
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
          <Link to={`/product/${params.id}`}>
            <button
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="View"
            >
              <AiOutlineEye size={16} />
            </button>
          </Link>
          <Link to={`/store-manager/edit-product/${params.id}`}>
            <button
              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              title="Edit"
            >
              <AiOutlineEdit size={16} />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(params.id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <AiOutlineDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStock =
      filterStock === "all" ||
      (filterStock === "low" && product.stock <= 5) ||
      (filterStock === "out" && product.stock === 0) ||
      (filterStock === "in" && product.stock > 5);
    return matchesSearch && matchesStock;
  });

  const rows = filteredProducts.map((item) => ({
    id: item._id,
    name: item.name,
    price: formatPrice(item.discountPrice || item.originalPrice),
    stock: item.stock,
    sold: item.sold_out || 0,
  }));

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              Managing products for:{" "}
              <span className="font-medium text-blue-600">
                {shopData?.name}
              </span>
            </p>
          </div>
          <Link to="/store-manager/create-product">
            <button className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200 font-medium text-sm">
              <AiOutlinePlus className="mr-2" size={18} />
              Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <AiOutlineSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Stock Levels</option>
            <option value="in">In Stock (6+)</option>
            <option value="low">Low Stock (1-5)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">In Stock</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.stock > 5).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">
            {products.filter((p) => p.stock > 0 && p.stock <= 5).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock === 0).length}
          </p>
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

export default SMProducts;
