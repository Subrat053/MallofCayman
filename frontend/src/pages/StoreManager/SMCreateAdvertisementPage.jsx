import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMCreateEditAdvertisement from "../../components/StoreManager/SMCreateEditAdvertisement";

const SMCreateAdvertisementPage = () => {
  return (
    <div>
      <StoreManagerHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[280px]">
          <StoreManagerSideBar active={6} />
        </div>
        <div className="w-full justify-center flex min-h-screen pb-20 lg:pb-0">
          <SMCreateEditAdvertisement />
        </div>
      </div>
    </div>
  );
};

export default SMCreateAdvertisementPage;
