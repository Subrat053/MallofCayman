import React from "react";
import ShopDashboardLayout from "../components/Shop/Layout/ShopDashboardLayout";
import ReviewManagement from "../components/Shop/ReviewManagement";

const ReviewManagementPage = () => {
  return (
    <ShopDashboardLayout active={18}>
      <div className="p-3 sm:p-4 lg:p-6">
        <ReviewManagement />
      </div>
    </ShopDashboardLayout>
  );
};

export default ReviewManagementPage;
