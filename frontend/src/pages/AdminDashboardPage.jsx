import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={1} />
      <div className="flex pt-16 sm:pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[300px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={1} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-2 sm:px-4 800px:ml-[290px] 800px:px-0">
          <AdminDashboardMain />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
