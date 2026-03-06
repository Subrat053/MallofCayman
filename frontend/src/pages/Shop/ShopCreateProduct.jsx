import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import CreateProduct from "../../components/Shop/CreateProduct";

const ShopCreateProduct = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex relative">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-20">
          <DashboardSideBar active={4} />
        </div>

        {/* Main Content - Responsive margins and padding */}
        <div className="flex-1 lg:ml-[300px]">
          <div className="p-2 sm:p-3 lg:p-4">
            <CreateProduct />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCreateProduct;
