import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import StoreSettings from "../../components/Shop/StoreSettings";

const StoreSettingsPage = () => {
  return (
    <ShopDashboardLayout active={21}>
      <div className="p-3 sm:p-4 lg:p-6">
        <StoreSettings />
      </div>
    </ShopDashboardLayout>
  );
};

export default StoreSettingsPage;
