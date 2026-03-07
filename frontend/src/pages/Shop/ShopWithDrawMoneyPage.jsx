import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import WithdrawMoney from "../../components/Shop/WithdrawMoney";

const ShopWithDrawMoneyPage = () => {
  return (
    <ShopDashboardLayout active={10}>
      <div className="p-3 sm:p-4 lg:p-6">
        <WithdrawMoney />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopWithDrawMoneyPage;
