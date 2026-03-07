import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AdvertisementPayment from "../../components/Shop/AdvertisementPayment";

const ShopAdvertisementPayment = () => {
  return (
    <ShopDashboardLayout active={20}>
      <div className="p-3 sm:p-4 lg:p-6">
        <AdvertisementPayment />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAdvertisementPayment;
