import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllCoupons from "../../components/Shop/AllCoupons";

const ShopAllCoupouns = () => {
  return (
    <ShopDashboardLayout active={7}>
      <div className="p-4 sm:p-6">
        <AllCoupons />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAllCoupouns;
