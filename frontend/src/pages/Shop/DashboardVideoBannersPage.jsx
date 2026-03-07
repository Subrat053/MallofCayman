import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllVideoBanners from "../../components/Shop/AllVideoBanners";

const DashboardVideoBannersPage = () => {
  return (
    <ShopDashboardLayout active={9}>
      <div className="p-3 sm:p-4 lg:p-6">
        <AllVideoBanners />
      </div>
    </ShopDashboardLayout>
  );
};

export default DashboardVideoBannersPage;
