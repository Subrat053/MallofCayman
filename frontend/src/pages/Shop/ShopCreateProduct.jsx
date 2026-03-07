import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import CreateProduct from "../../components/Shop/CreateProduct";

const ShopCreateProduct = () => {
  return (
    <ShopDashboardLayout active={4}>
      <div className="p-3 sm:p-4 lg:p-6">
        <CreateProduct />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopCreateProduct;
