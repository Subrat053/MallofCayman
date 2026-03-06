import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import DashboardHero from "../../components/Shop/DashboardHero";

const ShopDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex pt-20">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:flex lg:w-[300px] lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-20">
          <DashboardSideBar active={1} />
        </div>

        {/* Main Content - Responsive margins and padding */}
        <div className="flex-1 lg:ml-[300px] ">
          <div className="p-1 sm:p-2 lg:p-4">
            <DashboardHero />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboardPage;
