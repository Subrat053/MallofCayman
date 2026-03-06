import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAdvertisements from "../components/Admin/AdminAdvertisements";

const AdminAdvertisementsPage = () => {
  return (
    <div>
      <AdminHeader activeMenuItem={22}/>
      
        <div className="flex pt-10">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden 800px:block w-[80px] 800px:w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
            <AdminSideBar active={22} />
          </div>
          <div className="flex-1 ml-[310px]">
            <AdminAdvertisements />
          </div>
        </div>
    </div>
  );
};

export default AdminAdvertisementsPage;
