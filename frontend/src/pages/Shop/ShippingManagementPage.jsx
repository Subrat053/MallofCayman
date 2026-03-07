import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import ShippingManagement from "../../components/Shop/ShippingManagement";

const ShippingManagementPage = () => {
  return (
    <ShopDashboardLayout active={14}>
      <div className="p-3 sm:p-4 lg:p-6">
        <ShippingManagement />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShippingManagementPage;
