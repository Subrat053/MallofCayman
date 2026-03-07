import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import ProductShippingManager from "../../components/Shop/ProductShippingManager";

const ProductShippingPage = () => {
  return (
    <ShopDashboardLayout active={14}>
      <div className="p-3 sm:p-4 lg:p-6">
        <ProductShippingManager />
      </div>
    </ShopDashboardLayout>
  );
};

export default ProductShippingPage;
