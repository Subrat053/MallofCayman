import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AdvertisementPricing from "../../components/Shop/AdvertisementPricing";

const ShopAdvertisementPricing = () => {
  return (
    <ShopDashboardLayout active={22}>
      <div className="p-3 sm:p-4 lg:p-6">
        <AdvertisementPricing />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAdvertisementPricing;
