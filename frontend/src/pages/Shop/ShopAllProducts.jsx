import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import AllProducts from "../../components/Shop/AllProducts";

const ShopAllProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex pt-20">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:flex lg:w-[300px] lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-20">
          <DashboardSideBar active={3} />
        </div>

        {/* Main Content - Responsive margins and padding */}
        <div className="flex-1 lg:ml-[300px] ">
          <div className="p-2 sm:p-3 lg:p-4">
            <AllProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAllProducts;
