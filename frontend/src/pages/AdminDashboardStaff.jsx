import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminStaffManagement from "../components/Admin/AdminStaffManagement";

const AdminDashboardStaff = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full pt-20">
        <AdminStaffManagement />
      </div>
    </div>
  );
};

export default AdminDashboardStaff;
