import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminCurrencySettings from "../components/Admin/AdminCurrencySettings";

const AdminCurrencySettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={25} />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="lg:w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={25} />
        </div>
        {/* Main Content */}
        <div className="flex-1 lg:ml-[310px]">
          <AdminCurrencySettings />
        </div>
      </div>
    </div>
  );
};

export default AdminCurrencySettingsPage;
