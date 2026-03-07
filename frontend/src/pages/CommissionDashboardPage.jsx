import React from "react";
import ShopDashboardLayout from "../components/Shop/Layout/ShopDashboardLayout";
import CommissionDashboard from "../components/Shop/CommissionDashboard";

const CommissionDashboardPage = () => {
  return (
    <ShopDashboardLayout active={12}>
      <div className="p-3 sm:p-4 lg:p-6">
        <CommissionDashboard />
      </div>
    </ShopDashboardLayout>
  );
};

export default CommissionDashboardPage;
