import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminReviewManagement from "../components/Admin/AdminReviewManagement";

const AdminReviewManagementPage = () => {
  return (
    <div className="min-h-screen">
      <AdminHeader activeMenu={16} />
      <div className=" flex pt-20">
        {/* <div className="flex items-start justify-between w-full"> */}
        <div className="hidden 800px:block fixed top-16 left-0 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={16} />
        </div>
        <div className="flex-1 800px:ml-[310px]">
          <AdminReviewManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminReviewManagementPage;
