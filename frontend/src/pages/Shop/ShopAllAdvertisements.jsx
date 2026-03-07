import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllAdvertisements from "../../components/Shop/AllAdvertisements";

const ShopAllAdvertisements = () => {
  return (
    <ShopDashboardLayout active={20}>
      <div className="p-3 sm:p-4 lg:p-6">
        <AllAdvertisements />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAllAdvertisements;
