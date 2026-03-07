import React from "react";
import ShopDashboardLayout from "../../components/Shop/Layout/ShopDashboardLayout";
import AllEvents from "../../components/Shop/AllEvents";

const ShopAllEvents = () => {
  return (
    <ShopDashboardLayout active={5}>
      <div className="p-4 sm:p-6">
        <AllEvents />
      </div>
    </ShopDashboardLayout>
  );
};

export default ShopAllEvents;
