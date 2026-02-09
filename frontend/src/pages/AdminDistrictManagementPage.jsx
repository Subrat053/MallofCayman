import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminDistrictManagement from "../components/Admin/AdminDistrictManagement";

const AdminDistrictManagementPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdminHeader />
      <div className="flex h-[calc(100vh-80px)] mt-[80px]">
        {/* Sidebar - Fixed */}
        <div className="hidden 800px:block w-[80px] 800px:w-[250px] flex-shrink-0 h-full overflow-y-auto">
          <AdminSideBar active={14} />
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 h-full overflow-y-auto p-4 800px:p-6">
          <AdminDistrictManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDistrictManagementPage;
