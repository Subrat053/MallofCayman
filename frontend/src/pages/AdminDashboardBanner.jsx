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
        <div className="lg:w-[310px] hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={8} />
        </div>
        {/* Main Content */}
        <div className="flex-1 ml-[310px]">
          <AdminBannerEditor />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardBanner;
