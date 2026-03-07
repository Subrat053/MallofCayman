import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllProducts from "../../components/Shop/AllProducts";

const ShopAllProducts = () => {
  return (
    <ShopDashboardLayout active={3}>
      <div className="p-3 sm:p-4 lg:p-6">
        <AllProducts />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAllProducts;
