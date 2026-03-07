import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import DashboardHero from "../../components/Shop/DashboardHero";

const ShopDashboardPage = () => {
  return (
    <ShopDashboardLayout active={1}>
      <div className="p-3 sm:p-4 lg:p-6">
        <DashboardHero />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopDashboardPage;
