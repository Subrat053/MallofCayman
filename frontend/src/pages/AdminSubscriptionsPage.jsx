import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSubscriptions from "../components/Admin/AdminSubscriptions";

const AdminSubscriptionsPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdminHeader />
      <div className="flex mt-[80px]">
        {/* Sidebar - Fixed */}
        <div className="hidden 800px:block w-[80px] fixed top-16 left-0 z-10 800px:w-[310px] h-[calc(100vh-4rem)]">
          <AdminSideBar active={17} />
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 lg:ml-[310px]">
          <AdminSubscriptions />
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
