import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import CreateVideoBanner from "../../components/Shop/CreateVideoBanner";

const CreateVideoBannerPage = () => {
  return (
    <ShopDashboardLayout active={10}>
      <div className="p-3 sm:p-4 lg:p-6">
        <CreateVideoBanner />
      </div>
    </ShopDashboardLayout>
  );
};

export default CreateVideoBannerPage;
