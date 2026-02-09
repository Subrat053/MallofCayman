import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAdPlanManagement from "../components/Admin/AdminAdPlanManagement";

const AdminAdPlanManagementPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex pt-20">
        <div className="flex items-start justify-between w-full">
          {/* Sidebar - Hidden on mobile, sticky on desktop */}
          <div className="hidden 800px:block w-[80px] 800px:w-[250px] sticky top-20 h-[calc(100vh-80px)] flex-shrink-0">
            <AdminSideBar active={23} />
          </div>
          <div className="w-full justify-center flex overflow-y-auto">
            <AdminAdPlanManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdPlanManagementPage;
