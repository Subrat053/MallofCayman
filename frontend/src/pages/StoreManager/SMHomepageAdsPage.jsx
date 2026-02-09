import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMHomepageAds from "../../components/StoreManager/SMHomepageAds";

const SMHomepageAdsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoreManagerHeader />
      <div className="flex">
        <div className="hidden 800px:block w-[280px] fixed left-0 top-0 h-full z-40">
          <StoreManagerSideBar active={7} />
        </div>
        <div className="w-full 800px:ml-[280px] pt-[70px] min-h-screen">
          <SMHomepageAds />
        </div>
      </div>
    </div>
  );
};

export default SMHomepageAdsPage;
