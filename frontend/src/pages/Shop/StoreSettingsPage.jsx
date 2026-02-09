import React from "react";
import StoreSettings from "../../components/Shop/StoreSettings";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";

const StoreSettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="">
          <DashboardSideBar active={21} />
        </div>
        <div className="flex-1 mobile-content-padding">
          <StoreSettings />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={21} />
      </div>
    </div>
  );
};

export default StoreSettingsPage;
