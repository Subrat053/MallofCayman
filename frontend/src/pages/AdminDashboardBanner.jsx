import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminBannerEditor from "../components/Admin/AdminBannerEditor";

const AdminDashboardBanner = () => {
  return (
    <div>
      <AdminHeader activeMenuItem={8} />
      <div className="w-full flex pt-16 sm:pt-20">
        <div className="w-full px-2 sm:px-4 800px:px-8">
          <AdminBannerEditor />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardBanner;
