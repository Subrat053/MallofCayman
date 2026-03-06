import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminDistrictManagement from "../components/Admin/AdminDistrictManagement";

const AdminDistrictManagementPage = () => {
  return (
    <div className="h-screen bg-gray-50">
      <AdminHeader activeMenu={14}/>
      <div className="flex mt-[80px]">
        {/* Sidebar - Fixed */}
        <div className="hidden 800px:block w-[80px] 800px:w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={14} />
        </div>
        {/* Main Content - Scrollable */}
        <div className="flex-1 800px:ml-[310px]">
          <AdminDistrictManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDistrictManagementPage;
