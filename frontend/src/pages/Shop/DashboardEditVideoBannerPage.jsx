import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import EditVideoBanner from "../../components/Shop/EditVideoBanner";

const DashboardEditVideoBannerPage = () => {
  return (
    <ShopDashboardLayout active={9}>
      <div className="p-3 sm:p-4 lg:p-6">
        <EditVideoBanner />
      </div>
    </ShopDashboardLayout>
  );
};

export default DashboardEditVideoBannerPage;
