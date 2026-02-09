import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAdvertisements from "../components/Admin/AdminAdvertisements";

const AdminAdvertisementsPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex pt-20">
        <div className="flex items-start justify-between w-full">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden 800px:block w-[80px] 800px:w-[330px]">
            <AdminSideBar active={22} />
          </div>
          <div className="w-full justify-center flex">
            <AdminAdvertisements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvertisementsPage;
