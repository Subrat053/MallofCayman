import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import CreateAdvertisement from "../../components/Shop/CreateAdvertisement";

const ShopCreateAdvertisement = () => {
  return (
    <ShopDashboardLayout active={21}>
      <div className="p-3 sm:p-4 lg:p-6">
        <CreateAdvertisement />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopCreateAdvertisement;
