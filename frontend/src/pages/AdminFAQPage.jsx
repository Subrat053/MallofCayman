import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminFAQManagement from "../components/Admin/AdminFAQManagement";

const AdminFAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={15} />
      <div className="flex pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={15} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-[310px]">
          {/* <div className="pt-16 sm:pt-20 800px:pt-0 800px:p-6"> */}
            <AdminFAQManagement />
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminFAQPage;
