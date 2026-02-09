import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminSiteSettings from "../components/Admin/AdminSiteSettings.jsx";

const AdminSiteSettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={14} />
      <div className="flex pt-16 sm:pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={14} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-2 sm:px-4 800px:ml-64 800px:px-0">
          <AdminSiteSettings />
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettingsPage;
