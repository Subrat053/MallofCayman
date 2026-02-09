import React from "react";
import ProductShippingManager from "../../components/Shop/ProductShippingManager";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";

const ProductShippingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="hidden lg:block">
          <DashboardSideBar active={11} />
        </div>
        <div className="flex-1 w-full pt-16 lg:pt-0 pb-20 lg:pb-0">
          <ProductShippingManager />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={11} />
      </div>
    </div>
  );
};

export default ProductShippingPage;
