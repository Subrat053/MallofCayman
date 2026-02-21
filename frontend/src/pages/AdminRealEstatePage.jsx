import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminPropertyManagement from "../components/Admin/AdminPropertyManagement";

const AdminRealEstatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={30} />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={30} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-2 sm:px-4 800px:ml-64 800px:px-0">
          <div className="pt-16 sm:pt-20 800px:pt-0 800px:p-6">
            <AdminPropertyManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRealEstatePage;
