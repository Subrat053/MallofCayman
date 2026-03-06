import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAdPlanManagement from "../components/Admin/AdminAdPlanManagement";

const AdminAdPlanManagementPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader activeMenuItem={23}/>
        <div className="flex">
            {/* Sidebar - Hidden on mobile, sticky on desktop */}
            <div className="hidden 800px:block w-[80px] 800px:w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] flex-shrink-0">
              <AdminSideBar active={23} />
            </div>
            <div className="flex-1 lg:ml-[310px] lg:pt-8">
              <AdminAdPlanManagement />
            </div>
        </div>
      </div>

      
    </>
  );
};

export default AdminAdPlanManagementPage;
