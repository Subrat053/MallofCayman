import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllRefundOrders from "../../components/Shop/AllRefundOrders";

const ShopAllRefunds = () => {
  return (
    <ShopDashboardLayout active={12}>
      <div className="p-4 sm:p-6">
        <AllRefundOrders />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAllRefunds;
