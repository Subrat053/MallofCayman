import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAnalytics from "../components/Admin/AdminAnalytics";

const AdminAnalyticsPage = () => {
  return (
    <div>
      <AdminHeader activeMenu={8} />
      <div className="flex pt-20">
        
          <div className="lg:w-[310px] fixed left-0 top-16 h-[calc(100vh-4rem)] z-10 hidden lg:block">
            <AdminSideBar active={8} />
          </div>
          <div className="w-full justify-center flex ml-[310px]">
            <AdminAnalytics />
          </div>
        
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
