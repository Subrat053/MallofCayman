import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import VendorDeliverySetup from "../components/Shop/VendorDeliverySetup";

const VendorDeliverySetupPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={15} />
        </div>
        <div className="w-full min-h-screen bg-gray-50 p-4">
          <VendorDeliverySetup />
        </div>
      </div>
    </div>
  );
};

export default VendorDeliverySetupPage;
