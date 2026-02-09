import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminPlanManagement from "../components/Admin/AdminPlanManagement";

const AdminPlanManagementPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdminHeader />
      <div className="flex h-[calc(100vh-80px)] mt-[80px]">
        {/* Sidebar - Fixed */}
        <div className="hidden 800px:block w-[80px] 800px:w-[250px] flex-shrink-0 h-full overflow-y-auto">
          <AdminSideBar active={18} />
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 h-full overflow-y-auto p-4 800px:p-6">
          <AdminPlanManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManagementPage;
