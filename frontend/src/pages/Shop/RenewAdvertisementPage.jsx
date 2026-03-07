import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import RenewAdvertisement from "../../components/Shop/RenewAdvertisement";

const RenewAdvertisementPage = () => {
  return (
    <ShopDashboardLayout active={20}>
      <div className="p-3 sm:p-4 lg:p-6">
        <RenewAdvertisement />
      </div>
    </ShopDashboardLayout>
  );
};

export default RenewAdvertisementPage;
