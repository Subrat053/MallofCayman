import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import SubscriptionPlans from "../components/Shop/SubscriptionPlans";

const SubscriptionPlansPage = () => {
  const { isSeller } = useSelector((state) => state.seller);

  // If seller is logged in, show dashboard layout
  if (isSeller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
            <DashboardSideBar active={15} />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-56 pt-2 sm:pt-4 px-2 sm:px-4 pb-20 lg:pb-4">
            <SubscriptionPlans />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <DashboardSideBar active={15} />
        </div>
      </div>
    );
  }

  // Public view - show normal header/footer layout
  return (
    <div>
      <Header activeHeading={4} />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <SubscriptionPlans isPublic={true} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionPlansPage;
