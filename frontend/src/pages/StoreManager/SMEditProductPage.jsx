import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMEditProduct from "../../components/StoreManager/SMEditProduct";

const SMEditProductPage = () => {
  return (
    <div>
      <StoreManagerHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <StoreManagerSideBar active={2} />
        </div>
        <div className="w-full justify-center flex mt-16">
          <SMEditProduct />
        </div>
      </div>
    </div>
  );
};

export default SMEditProductPage;
