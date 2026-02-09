import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminBannerEditor from "../components/Admin/AdminBannerEditor";

const AdminDashboardBanner = () => {
  return (
    <div>
      <AdminHeader activeMenuItem={8} />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="lg:w-[300px] min-h-screen bg-white shadow-sm border-r border-gray-200 hidden 800px:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <AdminSideBar active={8} />
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6 ml-[290px]">
          <AdminBannerEditor />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardBanner;
