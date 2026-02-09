import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import StoreManagerDashboard from "../../components/StoreManager/StoreManagerDashboard";

const StoreManagerDashboardPage = () => {
  return (
    <div>
      <StoreManagerHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <StoreManagerSideBar active={1} />
        </div>
        <div className="w-full justify-center flex mt-16">
          <StoreManagerDashboard />
        </div>
      </div>
    </div>
  );
};

export default StoreManagerDashboardPage;
