import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMAdPlanManagement from "../../components/StoreManager/SMAdPlanManagement";

const SMAdPlanManagementPage = () => {
  return (
    <div>
      <StoreManagerHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[280px]">
          <StoreManagerSideBar active={5} />
        </div>
        <div className="w-full justify-center flex min-h-screen pb-20 lg:pb-0">
          <SMAdPlanManagement />
        </div>
      </div>
    </div>
  );
};

export default SMAdPlanManagementPage;
