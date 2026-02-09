import React, { useEffect } from "react";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { DataGrid } from "@material-ui/data-grid";
import {
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { FiPackage, FiEye } from "react-icons/fi";
import { MdCheckCircle, MdPending } from "react-icons/md";
import { Button } from "@material-ui/core";
import { getOrderNumber } from "../../utils/orderUtils";
import styles from "../../styles/styles";
import { useCurrency } from "../../context/CurrencyContext";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );
  const { sellers } = useSelector((state) => state.seller);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
  }, [dispatch]);

  const adminEarning =
    adminOrders &&
    adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.1, 0);
  const adminBalance = adminEarning?.toFixed(2);

  const columns = [
    {
      field: "orderNumber",
      headerName: "Order ID",
      minWidth: 180,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div
          className="text-xs font-mono text-primary-600 truncate"
          title={params.value}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let statusClass = "bg-gray-100 text-gray-800";
        let StatusIcon = MdPending;

        switch (status) {
          case "Delivered":
            statusClass = "bg-green-100 text-green-800";
            StatusIcon = MdCheckCircle;
            break;
          case "Shipped":
          case "On the way":
            statusClass = "bg-blue-100 text-blue-800";
            StatusIcon = FiPackage;
            break;
          case "Processing":
            statusClass = "bg-yellow-100 text-yellow-800";
            StatusIcon = MdPending;
            break;
          default:
            statusClass = "bg-gray-100 text-gray-800";
        }

        return (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
          >
            <StatusIcon size={12} />
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center space-x-1">
          <FiPackage size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">{params.value}</span>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 120,
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="font-semibold text-primary-600">{params.value}</div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center">
          <Button
            className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
            title="View Order Details"
            onClick={() => {
              window.open(`/admin/order/${params.id}`, "_blank");
            }}
          >
            <FiEye size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id, // Keep _id for internal DataGrid use
        orderNumber: getOrderNumber(item), // Use formatted order number for display
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: formatPrice(item?.totalPrice),
        status: item?.status,
      });
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4 800px:p-6">
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HiOutlineViewGrid className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl 800px:text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Welcome back! Here's what's happening.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 800px:grid-cols-3 gap-2 sm:gap-4 800px:gap-6 mb-4 sm:mb-6">
            {/* Total Earnings */}
            <div className={`${styles.card} p-3 sm:p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Earnings
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-primary-600">
                    {formatPrice(adminBalance)}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                      +12.5%
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <AiOutlineMoneyCollect className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Sellers */}
            <div className={`${styles.card} p-3 sm:p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Sellers
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {sellers && sellers.length}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                      +5.2%
                    </span>
                  </div>
                  <Link
                    to="/admin-sellers"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 sm:mt-2 inline-block transition-colors"
                  >
                    View →
                  </Link>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HiOutlineUserGroup className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div
              className={`${styles.card} p-3 sm:p-4 col-span-2 sm:col-span-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    {adminOrders && adminOrders.length}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800">
                      +8.1%
                    </span>
                  </div>
                  <Link
                    to="/admin-orders"
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium mt-1 sm:mt-2 inline-block transition-colors"
                  >
                    View →
                  </Link>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HiOutlineShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className={`${styles.card} overflow-hidden`}>
            <div className="p-3 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MdBorderClear className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                      Latest Orders
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {row.length} order{row.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin-orders"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  View All
                </Link>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden p-2">
              {adminOrderLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : row.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No orders found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {row.slice(0, 8).map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-primary-600 truncate max-w-[150px]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Shipped" ||
                                order.status === "On the way"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiPackage size={12} /> {order.itemsQty} items
                        </span>
                        <span className="font-semibold text-primary-600">
                          {order.total}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() =>
                            window.open(`/admin/order/${order.id}`, "_blank")
                          }
                          className="text-xs text-blue-600 font-medium flex items-center gap-1"
                        >
                          <FiEye size={12} /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop DataGrid */}
            <div className="hidden sm:block h-[500px] w-full">
              {adminOrderLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={8}
                  rowsPerPageOptions={[8, 15, 25]}
                  disableSelectionOnClick
                  autoHeight={false}
                  className="!border-0"
                  sx={{
                    "& .MuiDataGrid-main": {
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        "& .MuiDataGrid-columnHeader": {
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          color: "#374151",
                          padding: "12px",
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        padding: "12px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.875rem",
                      },
                      "& .MuiDataGrid-row": {
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                        },
                      },
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
