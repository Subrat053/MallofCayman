import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineLogout } from "react-icons/ai";
import { FiPackage, FiShoppingBag, FiTruck } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import {
  MdOutlineCampaign,
  MdOutlineAdsClick,
  MdOutlineSpeakerGroup,
} from "react-icons/md";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const StoreManagerSideBar = ({ active }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // Logout handler
  const logoutHandler = async () => {
    try {
      // Clear user authentication
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      navigate("/login");
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: 1,
      title: "Dashboard",
      link: "/store-manager/dashboard",
      icon: RxDashboard,
      badge: null,
    },
    {
      id: 2,
      title: "Products",
      link: "/store-manager/products",
      icon: FiPackage,
      badge: null,
    },
    {
      id: 3,
      title: "Orders",
      link: "/store-manager/orders",
      icon: FiShoppingBag,
      badge: null,
    },
    {
      id: 4,
      title: "Inventory",
      link: "/store-manager/inventory",
      icon: FiTruck,
      badge: null,
    },
    {
      id: 5,
      title: "Ad Plans",
      link: "/store-manager/ad-plans",
      icon: MdOutlineCampaign,
      badge: null,
    },
    {
      id: 6,
      title: "Store Ads",
      link: "/store-manager/advertisements",
      icon: MdOutlineAdsClick,
      badge: null,
      description: "Internal store page ads",
    },
    {
      id: 7,
      title: "Homepage Ads",
      link: "/store-manager/homepage-ads",
      icon: HiOutlineSpeakerphone,
      badge: "NEW",
      description: "Ads on site homepage",
    },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header Section */}
      <div
        className={`${
          mobile ? "p-5 pb-4" : "p-6 pb-4"
        } border-b border-gray-100/80 flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            {(!isCollapsed || mobile) && (
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-gray-800 truncate">
                  Store Manager
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Manage operations
                </p>
              </div>
            )}
          </div>
          {!mobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <AiOutlineMenu
                size={16}
                className={`text-gray-500 transition-transform duration-200 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
          {mobile && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <AiOutlineClose size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div
        className={`flex-1 ${
          mobile ? "p-5 pt-4" : "p-4 pt-4"
        } space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide`}
        style={{
          WebkitScrollbar: { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              to={item.link}
              onClick={() => mobile && setIsMobileSidebarOpen(false)}
              className={`relative flex items-center rounded-xl transition-all duration-200 group ${
                isCollapsed && !mobile
                  ? "p-3 justify-center"
                  : mobile
                    ? "p-4 space-x-4"
                    : "p-3 space-x-3"
              } ${
                isActive
                  ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 shadow-sm"
                  : "hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200/50"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-110"
                    : mobile
                      ? "bg-gray-100 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-600"
                      : "text-gray-600 group-hover:text-emerald-600"
                } ${
                  mobile ? "w-12 h-12" : isCollapsed ? "w-8 h-8" : "w-8 h-8"
                }`}
              >
                <IconComponent
                  size={mobile ? 20 : isCollapsed ? 18 : 18}
                  className="transition-all duration-200"
                />
              </div>

              {(!isCollapsed || mobile) && (
                <div className="flex-1 flex items-center justify-between min-w-0 overflow-hidden">
                  <span
                    className={`font-semibold transition-colors duration-200 truncate flex-shrink mr-2 ${
                      mobile ? "text-base" : "text-sm"
                    } ${
                      isActive
                        ? "text-emerald-700"
                        : "text-gray-700 group-hover:text-emerald-600"
                    }`}
                  >
                    {item.title}
                  </span>

                  {item.badge && (
                    <span
                      className={`inline-flex items-center justify-center text-xs font-medium rounded-full transition-all duration-200 leading-none ${
                        mobile
                          ? "min-w-[22px] h-[22px] px-2"
                          : "min-w-5 h-5 px-1.5"
                      } ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-red-500 text-white shadow-lg"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
              )}

              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Section */}
      <div
        className={`${
          mobile ? "p-5 pt-4" : "p-4 pt-4"
        } border-t border-gray-100/80 flex-shrink-0`}
      >
        {/* User Info */}
        <div
          className={`bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 rounded-xl transition-all duration-200 ${
            isCollapsed && !mobile ? "p-3" : mobile ? "p-4" : "p-4"
          }`}
        >
          {(!isCollapsed || mobile) && (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">
                  Logged in as: {user?.name || "Store Manager"}
                </span>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                You are managing store operations. For payment or settings
                changes, contact the store owner.
              </div>
            </>
          )}
          {isCollapsed && !mobile && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-r border-gray-200/80 shadow-xl transition-all duration-300 z-20 overflow-hidden ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-xl z-30 mobile-nav-blur">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 safe-area-inset-bottom">
          {[
            ...menuItems,
            {
              id: "more",
              title: "More",
              icon: AiOutlineMenu,
              link: "#",
              badge: null,
            },
          ].map((item, index) => {
            const IconComponent = item.icon;
            const isActive = active === item.id;
            const isMoreButton = item.id === "more";

            return (
              <div key={item.id || index} className="relative">
                {isMoreButton ? (
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 mobile-nav-item ${
                      isMobileSidebarOpen
                        ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-8 h-8 mb-1 ${
                        isMobileSidebarOpen
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-emerald-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      className={`text-xs font-medium truncate max-w-full leading-tight ${
                        isMobileSidebarOpen
                          ? "text-emerald-700"
                          : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ) : (
                  <Link
                    to={item.link}
                    className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 mobile-nav-item relative ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-8 h-8 mb-1 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-emerald-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      className={`text-xs font-medium truncate max-w-full leading-tight ${
                        isActive ? "text-emerald-700" : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-300 ease-out ${
            isMobileSidebarOpen
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-full opacity-0 scale-95"
          }`}
        >
          <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">SM</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Store Manager
                    </h1>
                    <p className="text-sm text-gray-500">Manage operations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <AiOutlineClose size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Operations
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = active === item.id;

                    return (
                      <Link
                        key={item.id}
                        to={item.link}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center p-4 border-b border-gray-50 last:border-b-0 transition-all duration-200 ${
                          isActive
                            ? "bg-emerald-50 border-r-4 border-emerald-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4
                            className={`font-semibold text-base ${
                              isActive ? "text-emerald-900" : "text-gray-900"
                            }`}
                          >
                            {item.title}
                          </h4>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={logoutHandler}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all duration-200 group mb-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors">
                  <AiOutlineLogout size={18} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-red-600 group-hover:text-red-700">
                    Logout
                  </h4>
                  <p className="text-sm text-red-500">
                    Sign out of your account
                  </p>
                </div>
              </button>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-emerald-700">
                    Store Manager Active
                  </span>
                </div>
                <p className="text-xs text-emerald-600">
                  Managing store operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreManagerSideBar;
