import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import ReviewManagement from "../components/Shop/ReviewManagement";

const ReviewManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <DashboardSideBar active={18} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-56 pt-2 sm:pt-4 px-2 sm:px-4 pb-20 lg:pb-4">
          <ReviewManagement />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={18} />
      </div>
    </div>
  );
};

export default ReviewManagementPage;
