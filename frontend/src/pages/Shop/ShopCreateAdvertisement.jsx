import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import CreateAdvertisement from "../../components/Shop/CreateAdvertisement";

const ShopCreateAdvertisement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <DashboardSideBar active={21} />
        </div>

        {/* Main Content - Add mobile content padding */}
        <div className="flex-1 lg:ml-56 pt-2 sm:pt-4 pb-20 lg:pb-4 px-1 sm:px-2 md:px-4">
          <CreateAdvertisement />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={21} />
      </div>
    </div>
  );
};

export default ShopCreateAdvertisement;
