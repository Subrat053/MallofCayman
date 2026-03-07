import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import EditProduct from "../../components/Shop/EditProduct";

const ShopEditProductPage = () => {
  return (
    <ShopDashboardLayout active={4}>
      <div className="p-3 sm:p-4 lg:p-6">
        <EditProduct />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopEditProductPage;
