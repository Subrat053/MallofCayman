import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import EditAdvertisement from "../../components/Shop/EditAdvertisement";

const EditAdvertisementPage = () => {
  return (
    <ShopDashboardLayout active={20}>
      <div className="p-3 sm:p-4 lg:p-6">
        <EditAdvertisement />
      </div>
    </ShopDashboardLayout>
  );
};

export default EditAdvertisementPage;
