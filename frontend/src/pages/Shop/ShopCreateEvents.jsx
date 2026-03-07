import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import CreateEvent from "../../components/Shop/CreateEvent";

const ShopCreateEvents = () => {
  return (
    <ShopDashboardLayout active={6}>
      <div className="p-3 sm:p-4 lg:p-6">
        <CreateEvent />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopCreateEvents;
