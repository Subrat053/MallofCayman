import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminReviewManager from "../components/Admin/AdminReviewManager.jsx";

const AdminReviewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={13} />
      <div className="flex pt-16 sm:pt-20">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-[320px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={13} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-2 sm:px-4 800px:ml-[320px] 800px:px-0">
          <AdminReviewManager />
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
