import React from "react";
import ShopDashboardLayout from "../components/Shop/Layout/ShopDashboardLayout";
import InventoryAlerts from "../components/Shop/InventoryAlerts";

const InventoryAlertsPage = () => {
  return (
    <ShopDashboardLayout active={19}>
      <div className="p-3 sm:p-4 lg:p-6">
        <InventoryAlerts />
      </div>
    </ShopDashboardLayout>
  );
};

export default InventoryAlertsPage;
