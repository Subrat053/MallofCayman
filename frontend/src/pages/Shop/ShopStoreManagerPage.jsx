import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import VendorStoreManager from "../../components/Shop/VendorStoreManager";

const ShopStoreManagerPage = () => {
  return (
    <ShopDashboardLayout active={24}>
      <div className="p-3 sm:p-4 lg:p-6">
        <VendorStoreManager />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopStoreManagerPage;
