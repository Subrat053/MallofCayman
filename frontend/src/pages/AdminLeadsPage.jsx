import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminLeadsManagement from "../components/Admin/AdminLeadsManagement";

const AdminLeadsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={31} />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="hidden 800px:block w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <AdminSideBar active={31} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-[310px] 800px:px-0">
          {/* <div className="pt-16 sm:pt-20 800px:pt-0 800px:p-6"> */}
            <AdminLeadsManagement />
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminLeadsPage;
