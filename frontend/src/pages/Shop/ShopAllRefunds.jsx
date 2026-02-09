import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import AllRefundOrders from "../../components/Shop/AllRefundOrders";

const ShopAllRefunds = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex relative">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-20">
          <DashboardSideBar active={9} />
        </div>

        {/* Main Content - Responsive margins and padding */}
        <div className="w-full lg:ml-64 min-h-[calc(100vh-5rem)]">
          <div className="p-4 sm:p-6 lg:p-8">
            <AllRefundOrders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAllRefunds;

