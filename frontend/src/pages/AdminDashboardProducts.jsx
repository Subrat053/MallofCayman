import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllProducts from "../components/Admin/AllProducts";

const AdminDashboardProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={5} />
      <div className="flex pt-16 sm:pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[310px] fixed left-0 top-16 h-full z-10">
          <AdminSideBar active={5} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full 800px:ml-[310px] 800px:px-4 py-4">
          <div className="max-w-full">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl 800px:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                All Products
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage and monitor all products
              </p>
            </div>
            <AllProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardProducts;
