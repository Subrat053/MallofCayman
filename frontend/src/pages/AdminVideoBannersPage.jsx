import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminVideoBanners from "../components/Admin/AdminVideoBanners.jsx";

const AdminVideoBannersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={16} />
      <div className="flex pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[320px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={16} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-[320px]">
          <AdminVideoBanners />
        </div>
      </div>
    </div>
  );
};

export default AdminVideoBannersPage;
