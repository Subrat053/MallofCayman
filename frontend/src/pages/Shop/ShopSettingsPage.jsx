import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import ShopSettings from "../../components/Shop/ShopSettings";

const ShopSettingsPage = () => {
  return (
    <ShopDashboardLayout active={16}>
      <div className="p-3 sm:p-4 lg:p-6">
        <ShopSettings />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopSettingsPage;
