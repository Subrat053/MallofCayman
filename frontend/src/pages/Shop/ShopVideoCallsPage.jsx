import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import VideoCallManager from "../../components/Shop/VideoCall/VideoCallManager";

const ShopVideoCallsPage = () => {
  return (
    <ShopDashboardLayout active={8}>
      <VideoCallManager />
    </ShopDashboardLayout>
  );
};

export default ShopVideoCallsPage;
