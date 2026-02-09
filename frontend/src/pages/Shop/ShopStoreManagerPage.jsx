import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import VendorStoreManager from "../../components/Shop/VendorStoreManager";

const ShopStoreManagerPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={24} />
        </div>
        <div className="w-full justify-center flex">
          <VendorStoreManager />
        </div>
      </div>
    </div>
  );
};

export default ShopStoreManagerPage;
