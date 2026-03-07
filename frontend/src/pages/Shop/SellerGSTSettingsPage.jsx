import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import SellerGSTSettings from "../../components/Shop/SellerGSTSettings";

const SellerGSTSettingsPage = () => {
  return (
    <ShopDashboardLayout active={17}>
      <div className="p-3 sm:p-4 lg:p-6">
        <SellerGSTSettings />
      </div>
    </ShopDashboardLayout>
  );
};

export default SellerGSTSettingsPage;
