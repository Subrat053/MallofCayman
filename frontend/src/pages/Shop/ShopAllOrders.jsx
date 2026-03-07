import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllOrders from "../../components/Shop/AllOrders";

const ShopAllOrders = () => {
  return (
    <ShopDashboardLayout active={2}>
      <AllOrders />
    </ShopDashboardLayout>
  );
};

export default ShopAllOrders;
