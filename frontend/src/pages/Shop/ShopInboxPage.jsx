import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
  return (
    <ShopDashboardLayout active={11}>
      <DashboardMessages />
    </ShopDashboardLayout>
  );
};

export default ShopInboxPage;
