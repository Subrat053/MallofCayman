import React from "react";
import StoreManagerHeader from "../../components/StoreManager/Layout/StoreManagerHeader";
import StoreManagerSideBar from "../../components/StoreManager/Layout/StoreManagerSideBar";
import SMHomepageAdPayment from "../../components/StoreManager/SMHomepageAdPayment";

const SMHomepageAdPaymentPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoreManagerHeader />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <StoreManagerSideBar active={7} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-56 pt-2 sm:pt-4 pb-20 lg:pb-4 px-1 sm:px-2 md:px-4">
          <SMHomepageAdPayment />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <StoreManagerSideBar active={7} />
      </div>
    </div>
  );
};

export default SMHomepageAdPaymentPage;
