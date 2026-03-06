import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminStaffManagement from "../components/Admin/AdminStaffManagement";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";

const AdminDashboardStaff = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={3} />
      <div className="flex pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={3} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-[310px]">
          <AdminStaffManagement />
        </div>
      </div>
    </div>

  );
};

export default AdminDashboardStaff;
