import React from "react";
import ShopDashboardLayout from "../components/Shop/Layout/ShopDashboardLayout";
import VendorDeliverySetup from "../components/Shop/VendorDeliverySetup";

const VendorDeliverySetupPage = () => {
  return (
    <ShopDashboardLayout active={15}>
      <div className="p-3 sm:p-4 lg:p-6">
        <VendorDeliverySetup />
      </div>
    </ShopDashboardLayout>
  );
};

export default VendorDeliverySetupPage;
