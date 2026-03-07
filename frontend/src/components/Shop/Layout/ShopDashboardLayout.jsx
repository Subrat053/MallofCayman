import React from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSideBar from "./DashboardSideBar";

/**
 * Shared layout wrapper for all seller dashboard pages.
 * - Fixed header at top
 * - Fixed sidebar on desktop (300px wide), bottom nav on mobile
 * - Content area offset correctly for both breakpoints
 */
const ShopDashboardLayout = ({ children, active }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex pt-20">
        {/* Content pushed right by sidebar width on desktop; padded bottom for mobile nav */}
        <div className="flex-1 lg:ml-[300px] pb-20 lg:pb-0">{children}</div>
      </div>
      {/* DashboardSideBar renders its own desktop fixed sidebar + mobile bottom nav */}
      <DashboardSideBar active={active} />
    </div>
  );
};

export default ShopDashboardLayout;
