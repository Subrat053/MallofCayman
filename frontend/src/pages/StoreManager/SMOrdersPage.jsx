import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMOrders from "../../components/StoreManager/SMOrders";

const SMOrdersPage = () => {
  return (
    <div>
      <StoreManagerHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <StoreManagerSideBar active={3} />
        </div>
        <div className="w-full justify-center flex mt-16">
          <SMOrders />
        </div>
      </div>
    </div>
  );
};

export default SMOrdersPage;
