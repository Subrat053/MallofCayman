import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import OrderDetails from "../../components/Shop/OrderDetails";

const ShopOrderDetails = () => {
  return (
    <ShopDashboardLayout active={2}>
      <OrderDetails />
    </ShopDashboardLayout>
  );
};

export default ShopOrderDetails;
