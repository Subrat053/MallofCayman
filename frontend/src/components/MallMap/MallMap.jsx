import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  HiChevronRight,
  HiLocationMarker,
  HiSparkles,
  HiViewGrid,
  HiShoppingBag,
} from "react-icons/hi";
import {
  FaStore,
  FaGem,
  FaCrown,
  FaMapMarkerAlt,
  FaCompass,
  FaStar,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";
import { MdStorefront, MdLocalMall, MdExplore } from "react-icons/md";
import { getRootCategoriesPublic } from "../../redux/actions/category";
import { backend_url, server } from "../../server";
import { getCategoryImageUrl } from "../../utils/mediaUtils";

const MallMap = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProducts } = useSelector((state) => state.products);
  const { sellers } = useSelector((state) => state.seller);
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [hoveredStore, setHoveredStore] = useState(null);
  const [goldSellers, setGoldSellers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  // Fetch Gold subscription sellers
  useEffect(() => {
    const fetchGoldSellers = async () => {
      try {
        const response = await axios.get(`${server}/shop/gold-sellers`);
        if (response.data.success) {
          setGoldSellers(response.data.sellers);
        }
      } catch (error) {
        console.error("Error fetching gold sellers:", error);
      }
    };
    fetchGoldSellers();
  }, []);

  // Use actual categories from database
  const categoriesData = categories || [];

  // Dynamic position generator for any number of gold sellers
  const generateGoldSellerPositions = (count) => {
    if (count === 0) return [];

    const positions = [];

    // Premium spots (center of mall) - first priority
    const premiumSpots = [
      { x: 25, y: 25, width: 14, height: 14, zone: "PRIME" },
      { x: 45, y: 25, width: 14, height: 14, zone: "PRIME" },
      { x: 65, y: 25, width: 14, height: 14, zone: "PRIME" },
    ];

    // Secondary spots (good visibility)
    const secondarySpots = [
      { x: 10, y: 10, width: 12, height: 12, zone: "A" },
      { x: 28, y: 10, width: 12, height: 12, zone: "A" },
      { x: 46, y: 10, width: 12, height: 12, zone: "A" },
      { x: 64, y: 10, width: 12, height: 12, zone: "A" },
      { x: 82, y: 10, width: 12, height: 12, zone: "A" },
      { x: 10, y: 45, width: 12, height: 12, zone: "B" },
      { x: 28, y: 45, width: 12, height: 12, zone: "B" },
      { x: 46, y: 45, width: 12, height: 12, zone: "B" },
      { x: 64, y: 45, width: 12, height: 12, zone: "B" },
      { x: 82, y: 45, width: 12, height: 12, zone: "B" },
    ];

    // Side spots (left and right wings)
    const sideSpots = [
      { x: 4, y: 25, width: 12, height: 14, zone: "L" },
      { x: 4, y: 60, width: 12, height: 12, zone: "L" },
      { x: 84, y: 25, width: 12, height: 14, zone: "R" },
      { x: 84, y: 60, width: 12, height: 12, zone: "R" },
    ];

    // Bottom row spots
    const bottomSpots = [
      { x: 20, y: 60, width: 12, height: 12, zone: "C" },
      { x: 38, y: 60, width: 12, height: 12, zone: "C" },
      { x: 56, y: 60, width: 12, height: 12, zone: "C" },
      { x: 74, y: 60, width: 12, height: 12, zone: "C" },
    ];

    // Combine all predefined spots
    const allPredefinedSpots = [
      ...premiumSpots,
      ...secondarySpots,
      ...sideSpots,
      ...bottomSpots,
    ];

    // Use predefined spots first
    for (let i = 0; i < Math.min(count, allPredefinedSpots.length); i++) {
      positions.push(allPredefinedSpots[i]);
    }

    // If we need more positions, generate them dynamically in a grid
    if (count > allPredefinedSpots.length) {
      const remaining = count - allPredefinedSpots.length;
      const cols = Math.ceil(Math.sqrt(remaining));
      const rows = Math.ceil(remaining / cols);

      // Grid area for overflow stores
      const gridStartX = 8;
      const gridStartY = 8;
      const gridWidth = 84;
      const gridHeight = 65;
      const cellWidth = gridWidth / cols;
      const cellHeight = gridHeight / rows;
      const storeWidth = Math.min(cellWidth * 0.85, 14);
      const storeHeight = Math.min(cellHeight * 0.85, 12);

      for (let i = 0; i < remaining; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({
          x: gridStartX + col * cellWidth + (cellWidth - storeWidth) / 2,
          y: gridStartY + row * cellHeight + (cellHeight - storeHeight) / 2,
          width: storeWidth,
          height: storeHeight,
          zone: `G${i + 1}`,
        });
      }
    }

    return positions;
  };

  // Generate positions based on actual gold seller count
  const goldSellerPositions = generateGoldSellerPositions(goldSellers.length);

  // Only show real gold sellers - no fake stores
  const mallStores = goldSellers.map((seller, index) => ({
    id: `gold_${seller._id}`,
    name: seller.name,
    sellerId: seller._id,
    avatar: seller.avatar?.url,
    isGoldSeller: true,
    type: "gold",
    ...goldSellerPositions[index],
  }));

  // Mall decoration elements (corridors, facilities)
  const mallDecorations = {
    corridors: [
      { x: 2, y: 22, width: 96, height: 2 }, // Horizontal corridor
      { x: 2, y: 42, width: 96, height: 2 }, // Horizontal corridor
      { x: 2, y: 57, width: 96, height: 2 }, // Horizontal corridor
    ],
    facilities: [
      { type: "plaza", x: 50, y: 37, label: "MALL PLAZA" },
      { type: "info", x: 50, y: 77, label: "i" },
    ],
    entrances: [{ x: 42, y: 75, width: 16, height: 5, label: "MAIN ENTRANCE" }],
  };

  const toggleCategory = (category) => {
    // Navigate to products page filtered by this category
    const categoryName = category.name || category.title;
    setActiveCategory(category._id);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-white rounded-2xl shadow-2xl border border-blue-100/50 overflow-hidden backdrop-blur-sm">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-6 py-5">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mall Icon */}
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                  <MdLocalMall className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                  <HiSparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Mall Directory
                  <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-yellow-300 border border-yellow-400/30">
                    <FaCompass className="w-3 h-3" /> INTERACTIVE
                  </span>
                </h2>
                <p className="text-blue-100 text-sm mt-0.5 font-medium">
                  Explore our premium stores & discover amazing deals
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <FaStore className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {sellers?.length || 50}+
                  </div>
                  <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
                    Stores
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <FaShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {allProducts?.length || 500}+
                  </div>
                  <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
                    Products
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Sidebar - Categories */}
          <div className="lg:w-80 bg-gradient-to-b from-slate-50 to-white border-r border-blue-100/50 flex-shrink-0">
            {/* Category Header */}
            <div className="px-5 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <HiViewGrid className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Shop by Category
                  </h3>
                  <p className="text-xs text-gray-500">Browse our collection</p>
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 animate-pulse rounded-xl"
                    >
                      <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : categoriesData.length > 0 ? (
                  categoriesData.map((category, index) => (
                    <div
                      key={category._id || category.id || index}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        activeCategory === category._id
                          ? "bg-gradient-to-r from-primary-50 to-blue-50 border-primary-300 shadow-md"
                          : "border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:shadow-sm"
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      {/* Category Image */}
                      <div className="relative">
                        <div
                          className={`w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md transition-all duration-300 ${
                            activeCategory === category._id
                              ? "ring-2 ring-primary-400 ring-offset-2"
                              : "group-hover:ring-2 group-hover:ring-blue-300 group-hover:ring-offset-1"
                          }`}
                        >
                          <img
                            src={getCategoryImageUrl(
                              category.image || category.image_Url,
                              backend_url
                            )}
                            alt={category.name || category.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                (category.name || category.title || "C")[0]
                              )}&background=003DA5&color=fff&size=44`;
                            }}
                          />
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                            <FaStar className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block text-sm font-semibold truncate transition-colors ${
                            activeCategory === category._id
                              ? "text-primary-700"
                              : "text-gray-700 group-hover:text-primary-600"
                          }`}
                        >
                          {category.name || category.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          Explore collection
                        </span>
                      </div>

                      {/* Arrow */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          activeCategory === category._id
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-400 group-hover:bg-primary-500 group-hover:text-white"
                        }`}
                      >
                        <HiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <HiViewGrid className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      No categories available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 space-y-2.5">
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
              >
                <HiShoppingBag className="w-5 h-5" />
                Browse All Products
                <FaArrowRight className="w-3 h-3 ml-1" />
              </Link>
              <Link
                to="/shop-create"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
              >
                <MdStorefront className="w-5 h-5" />
                Become a Seller
              </Link>
            </div>
          </div>

          {/* Right Side - Mall Floor Plan */}
          <div className="flex-1 p-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col min-h-[450px]">
            {/* Map Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                  <HiLocationMarker className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-semibold text-gray-600">
                    Mall of Cayman - Promenade Level
                  </span>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="hidden md:flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setMapZoom(Math.max(0.8, mapZoom - 0.1))}
                  className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <span className="text-lg font-bold">−</span>
                </button>
                <span className="px-2 text-xs font-semibold text-gray-500">
                  {Math.round(mapZoom * 100)}%
                </span>
                <button
                  onClick={() => setMapZoom(Math.min(1.3, mapZoom + 0.1))}
                  className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>

            {/* Interactive Floor Plan */}
            <div
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden flex-1 border border-blue-200/50"
              style={{ minHeight: "320px" }}
            >
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-transparent rounded-br-3xl opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-100 to-transparent rounded-tl-3xl opacity-50"></div>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="mallGrid"
                      width="30"
                      height="30"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 30 0 L 0 0 0 30"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="0.5"
                      />
                    </pattern>
                    <linearGradient
                      id="goldGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" style={{ stopColor: "#FFD700" }} />
                      <stop offset="50%" style={{ stopColor: "#FFC107" }} />
                      <stop offset="100%" style={{ stopColor: "#FFB300" }} />
                    </linearGradient>
                    <linearGradient
                      id="retailGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" style={{ stopColor: "#8B5CF6" }} />
                      <stop offset="100%" style={{ stopColor: "#7C3AED" }} />
                    </linearGradient>
                    <linearGradient
                      id="entertainmentGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" style={{ stopColor: "#06B6D4" }} />
                      <stop offset="100%" style={{ stopColor: "#0891B2" }} />
                    </linearGradient>
                    <filter
                      id="dropShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="1"
                        stdDeviation="1"
                        floodOpacity="0.15"
                      />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mallGrid)" />
                </svg>
              </div>

              {/* Parking lot visual (top) */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-200 to-gray-100 flex overflow-hidden">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-300/50"
                    style={{ transform: "skewX(-15deg)", marginLeft: "-2px" }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest">
                    PARKING AREA
                  </span>
                </div>
              </div>

              {/* Mall Stores Map */}
              <svg
                viewBox="0 0 100 80"
                className="w-full h-full absolute inset-0 pt-6"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  transform: `scale(${mapZoom})`,
                  transformOrigin: "center",
                }}
              >
                <defs>
                  <linearGradient
                    id="goldGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#FFD700" }} />
                    <stop offset="50%" style={{ stopColor: "#FFC107" }} />
                    <stop offset="100%" style={{ stopColor: "#FFB300" }} />
                  </linearGradient>
                  <linearGradient
                    id="retailGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#8B5CF6" }} />
                    <stop offset="100%" style={{ stopColor: "#7C3AED" }} />
                  </linearGradient>
                  <linearGradient
                    id="entertainmentGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#06B6D4" }} />
                    <stop offset="100%" style={{ stopColor: "#0891B2" }} />
                  </linearGradient>
                  <linearGradient
                    id="anchorGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#3B82F6" }} />
                    <stop offset="100%" style={{ stopColor: "#1D4ED8" }} />
                  </linearGradient>
                  <filter
                    id="storeShadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0.3"
                      dy="0.5"
                      stdDeviation="0.5"
                      floodOpacity="0.2"
                    />
                  </filter>
                  <filter
                    id="goldGlow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="1"
                      floodColor="#FFD700"
                      floodOpacity="0.5"
                    />
                  </filter>
                </defs>
                {/* Mall background floor */}
                <rect
                  x="1"
                  y="3"
                  width="98"
                  height="74"
                  fill="#F1F5F9"
                  rx="2"
                />
                {/* Main corridors/walkways */}
                <rect x="14" y="3" width="4" height="74" fill="#E2E8F0" />{" "}
                {/* Left vertical corridor */}
                <rect x="64" y="3" width="4" height="74" fill="#E2E8F0" />{" "}
                {/* Right vertical corridor */}
                <rect x="14" y="15" width="54" height="3" fill="#E2E8F0" />{" "}
                {/* Top horizontal corridor */}
                <rect x="14" y="47" width="54" height="3" fill="#E2E8F0" />{" "}
                {/* Middle horizontal corridor */}
                <rect x="14" y="67" width="54" height="3" fill="#E2E8F0" />{" "}
                {/* Bottom horizontal corridor */}
                {/* Center plaza/atrium */}
                <ellipse
                  cx="40"
                  cy="40"
                  rx="8"
                  ry="5"
                  fill="#DBEAFE"
                  stroke="#93C5FD"
                  strokeWidth="0.3"
                />
                <text
                  x="40"
                  y="40.5"
                  textAnchor="middle"
                  className="text-[2px] font-bold fill-blue-500"
                >
                  PLAZA
                </text>
                {/* Fountain in center */}
                <circle cx="40" cy="40" r="2" fill="#60A5FA" opacity="0.5" />
                <circle cx="40" cy="40" r="1" fill="#3B82F6" opacity="0.7" />
                {/* Render all stores */}
                {mallStores.map((store) => {
                  const isGold = store.isGoldSeller || store.type === "gold";
                  const isAnchor = store.type === "anchor";
                  const isEntertainment = store.type === "entertainment";

                  let fillGradient = "url(#retailGradient)";
                  let strokeColor = "#6D28D9";

                  if (isGold) {
                    fillGradient = "url(#goldGradient)";
                    strokeColor = "#B8860B";
                  } else if (isAnchor) {
                    fillGradient = "url(#anchorGradient)";
                    strokeColor = "#1E40AF";
                  } else if (isEntertainment) {
                    fillGradient = "url(#entertainmentGradient)";
                    strokeColor = "#0E7490";
                  }

                  return (
                    <g
                      key={store.id}
                      filter={isGold ? "url(#goldGlow)" : "url(#storeShadow)"}
                    >
                      <rect
                        x={store.x}
                        y={store.y}
                        width={store.width}
                        height={store.height}
                        fill={fillGradient}
                        stroke={strokeColor}
                        strokeWidth={isGold ? "0.5" : "0.3"}
                        rx="0.8"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredStore(store.id)}
                        onMouseLeave={() => setHoveredStore(null)}
                        onClick={() => {
                          if (store.isGoldSeller && store.sellerId) {
                            navigate(`/shop/preview/${store.sellerId}`);
                          } else {
                            navigate(`/products`);
                          }
                        }}
                        style={{
                          filter:
                            hoveredStore === store.id
                              ? "brightness(1.15)"
                              : undefined,
                        }}
                      />

                      {/* Store name label */}
                      <text
                        x={store.x + store.width / 2}
                        y={store.y + store.height / 2 + (isGold ? 0.5 : 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`pointer-events-none font-semibold ${
                          isGold ? "text-[2.2px]" : "text-[1.8px]"
                        }`}
                        fill={isGold ? "#78350F" : "#FFFFFF"}
                      >
                        {store.name.length > (isAnchor ? 14 : 10)
                          ? store.name.substring(0, isAnchor ? 14 : 10) + "..."
                          : store.name}
                      </text>

                      {/* Gold crown indicator */}
                      {isGold && (
                        <g>
                          <circle
                            cx={store.x + store.width / 2}
                            cy={store.y + 2}
                            r="2"
                            fill="white"
                            opacity="0.9"
                          />
                          <text
                            x={store.x + store.width / 2}
                            y={store.y + 2.5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[3px] pointer-events-none"
                          >
                            👑
                          </text>
                        </g>
                      )}

                      {/* Zone label for non-gold stores */}
                      {!isGold && (
                        <text
                          x={store.x + store.width - 1.5}
                          y={store.y + 2}
                          textAnchor="middle"
                          className="text-[1.5px] font-bold fill-white opacity-70 pointer-events-none"
                        >
                          {store.zone}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* Entry points */}
                <g>
                  {/* Main entrance (bottom) */}
                  <rect
                    x="36"
                    y="74"
                    width="8"
                    height="3"
                    fill="#10B981"
                    rx="0.5"
                  />
                  <text
                    x="40"
                    y="78.5"
                    textAnchor="middle"
                    className="text-[1.8px] font-bold fill-emerald-700"
                  >
                    MAIN ENTRANCE
                  </text>

                  {/* Side entrance (left) */}
                  <rect
                    x="0"
                    y="35"
                    width="3"
                    height="6"
                    fill="#10B981"
                    rx="0.5"
                  />
                  <text
                    x="-0.5"
                    y="38"
                    textAnchor="middle"
                    className="text-[1.5px] font-bold fill-emerald-700"
                    transform="rotate(-90, -0.5, 38)"
                  >
                    WEST
                  </text>

                  {/* Side entrance (right) */}
                  <rect
                    x="97"
                    y="35"
                    width="3"
                    height="6"
                    fill="#10B981"
                    rx="0.5"
                  />
                </g>
                {/* Restroom indicators */}
                <g>
                  <rect
                    x="53"
                    y="16"
                    width="4"
                    height="3"
                    fill="#9CA3AF"
                    rx="0.3"
                  />
                  <text
                    x="55"
                    y="18"
                    textAnchor="middle"
                    className="text-[1.5px] fill-white font-bold"
                  >
                    WC
                  </text>
                </g>
                {/* Info desk */}
                <g>
                  <circle
                    cx="40"
                    cy="52"
                    r="2.5"
                    fill="#3B82F6"
                    stroke="#1D4ED8"
                    strokeWidth="0.3"
                  />
                  <text
                    x="40"
                    y="52.3"
                    textAnchor="middle"
                    className="text-[2px] fill-white font-bold"
                  >
                    i
                  </text>
                </g>
                {/* Escalator indicators */}
                <g>
                  <rect
                    x="18"
                    y="30"
                    width="3"
                    height="5"
                    fill="#6B7280"
                    rx="0.3"
                  />
                  <text
                    x="19.5"
                    y="33"
                    textAnchor="middle"
                    className="text-[1.2px] fill-white"
                  >
                    ↕
                  </text>
                </g>
                <g>
                  <rect
                    x="61"
                    y="30"
                    width="3"
                    height="5"
                    fill="#6B7280"
                    rx="0.3"
                  />
                  <text
                    x="62.5"
                    y="33"
                    textAnchor="middle"
                    className="text-[1.2px] fill-white"
                  >
                    ↕
                  </text>
                </g>
                {/* Compass indicator */}
                <g transform="translate(92, 72)">
                  <circle
                    r="4"
                    fill="white"
                    stroke="#CBD5E1"
                    strokeWidth="0.4"
                  />
                  <text
                    y="-0.5"
                    textAnchor="middle"
                    className="text-[2.5px] font-bold fill-red-500"
                  >
                    N
                  </text>
                  <polygon points="0,-2.5 -0.7,0 0.7,0" fill="#EF4444" />
                  <polygon points="0,2.5 -0.7,0 0.7,0" fill="#94A3B8" />
                </g>
              </svg>

              {/* Tooltip for hovered store */}
              {hoveredStore &&
                mallStores.find((s) => s.id === hoveredStore) && (
                  <div className="absolute top-4 left-4 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100 max-w-[240px] animate-fadeIn pointer-events-none">
                    {(() => {
                      const store = mallStores.find(
                        (s) => s.id === hoveredStore
                      );
                      if (!store) return null;

                      const isGold =
                        store.isGoldSeller || store.type === "gold";
                      const isAnchor = store.type === "anchor";
                      const isEntertainment = store.type === "entertainment";

                      let bgGradient = "from-purple-500 to-violet-600";
                      let typeLabel = "Retail Store";

                      if (isGold) {
                        bgGradient = "from-yellow-400 to-amber-500";
                        typeLabel = "⭐ Premium Gold Member";
                      } else if (isAnchor) {
                        bgGradient = "from-blue-500 to-blue-700";
                        typeLabel = "Anchor Store";
                      } else if (isEntertainment) {
                        bgGradient = "from-cyan-500 to-teal-600";
                        typeLabel = "Food & Entertainment";
                      }

                      return (
                        <>
                          <div className="flex items-center gap-3">
                            {isGold && store.avatar ? (
                              <img
                                src={store.avatar}
                                alt={store.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-yellow-400 shadow-md"
                              />
                            ) : (
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${bgGradient}`}
                              >
                                <FaStore className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5 flex-wrap">
                                <span className="truncate max-w-[120px]">
                                  {store.name}
                                </span>
                                {isGold && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex-shrink-0">
                                    <FaCrown className="w-2.5 h-2.5 text-yellow-800" />
                                  </span>
                                )}
                              </div>
                              <div
                                className={`text-xs font-semibold ${
                                  isGold ? "text-amber-600" : "text-gray-500"
                                }`}
                              >
                                {typeLabel}
                              </div>
                              <div className="text-xs text-gray-400">
                                Zone {store.zone}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                              <MdExplore className="w-4 h-4" />
                              {isGold
                                ? "Click to visit shop"
                                : "Click to view products"}
                              <FaArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
            </div>

            {/* Legend - Redesigned */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-700 mb-2.5 flex items-center gap-2">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-primary-500" />
                    Store Directory
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded bg-gradient-to-r from-yellow-400 to-amber-400 shadow-sm border border-yellow-500"></div>
                      <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                        <FaCrown className="w-2.5 h-2.5 text-yellow-500" /> Gold
                        Members
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-700 shadow-sm"></div>
                      <span className="text-[11px] font-semibold text-gray-600">
                        Anchor Stores
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded bg-gradient-to-r from-purple-500 to-violet-600 shadow-sm"></div>
                      <span className="text-[11px] font-semibold text-gray-600">
                        Retail
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-3 rounded bg-gradient-to-r from-cyan-500 to-teal-500 shadow-sm"></div>
                      <span className="text-[11px] font-semibold text-gray-600">
                        Food & Entertainment
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm"></div>
                      <span className="text-[11px] font-semibold text-gray-600">
                        Entrances
                      </span>
                    </div>
                  </div>
                </div>

                {goldSellers.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <span className="text-lg">👑</span>
                    <span className="text-xs font-bold text-amber-700">
                      {goldSellers.length} Premium Gold Seller
                      {goldSellers.length !== 1 ? "s" : ""} Featured
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Quick Actions - Redesigned */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Link
                to="/shops"
                className="group flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 text-sm"
              >
                <FaStore className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
                View All Stores
                <FaArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                to="/products"
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                <FaGem className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Shop Now
                <FaArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MallMap;
