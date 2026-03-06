import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminBlogManagement from "../components/Admin/AdminBlogManagement";

const AdminBlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={29} />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="hidden 800px:block w-[310px] fixed left-0 top-16 h-full z-10">
          <AdminSideBar active={29} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-2 sm:px-4 800px:ml-[310px] 800px:px-0">
          
            <AdminBlogManagement />
          
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;
