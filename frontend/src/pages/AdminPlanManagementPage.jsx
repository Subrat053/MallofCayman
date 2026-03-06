import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminPlanManagement from "../components/Admin/AdminPlanManagement";

const AdminPlanManagementPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdminHeader />
      <div className="flex mt-[80px]">
        {/* Sidebar - Fixed */}
        <div className="hidden md:block w-[80px] 800px:w-[310px] fixed h-[calc(100vh-80px)] overflow-y-auto">
          <AdminSideBar active={18} />
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 ml-[310px]">
          <AdminPlanManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManagementPage;
