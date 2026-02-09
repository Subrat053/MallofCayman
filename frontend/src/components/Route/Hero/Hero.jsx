import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../../server";
import { getBannerImageUrl } from "../../../utils/mediaUtils";
import SlidingBanner from "./SlidingBanner";
import { Search, ShoppingBag, Store, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Customers' },
    { icon: ShoppingBag, value: '5K+', label: 'Products' },
    { icon: TrendingUp, value: '99%', label: 'Satisfaction' },
  ];

  const [banner, setBanner] = useState({
    title: "Best Collection for",
    subtitle: "Home Decoration",
    description:
      "Discover our curated collection of premium home decor items that transform your space into a beautiful sanctuary.",
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    buttonText: "Shop Now",
    secondaryButtonText: "View Collections",
    stats: {
      customers: { count: "10K+", label: "Happy Customers" },
      products: { count: "5K+", label: "Products" },
      satisfaction: { count: "99%", label: "Satisfaction" },
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBannerData();
  }, []);

  // Also refresh banner data when component becomes visible (e.g., user navigates back to home)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing banner data");
        fetchBannerData();
      }
    };

    const handleBannerUpdate = (event) => {
      console.log("Received banner update event:", event.detail);
      setBanner(event.detail);
      // Force image reload by updating the state
      setTimeout(() => {
        setBanner((prev) => ({ ...prev, _imageRefresh: Date.now() }));
      }, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("bannerUpdated", handleBannerUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("bannerUpdated", handleBannerUpdate);
    };
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to force fresh data
      const { data } = await axios.get(
        `${server}/banner/get-banner?t=${Date.now()}`
      );
      console.log("Banner data received:", data);
      console.log("Banner display mode:", data.banner?.displayMode);
      console.log("Banner images count:", data.banner?.images?.length || 0);
      console.log("Banner images array:", data.banner?.images);
      if (data.success && data.banner) {
        console.log("Setting banner data:", data.banner);
        setBanner(data.banner);
      }
    } catch (error) {
      console.error("Error fetching banner data:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  // Get image URL using utility function
  const getImageUrl = (image) => {
    return getBannerImageUrl(image, backend_url);
  };
  return (
    <>
      <div className="relative w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl border border-purple-200/20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-rose-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-full border border-cyan-400/20">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-100">Premium Shopping Experience</span>
              </div>

              <h1 className="text-2xl md:text-2xl lg:text-3xl xl:text-5xl font-bold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  {banner.title}
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 mt-2">
                  {banner.subtitle}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
                {banner.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Link to="/products">
                  <button className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 text-base shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 border border-cyan-400/20">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      {banner.buttonText || "Shop Now"}
                    </span>
                  </button>
                </Link>
                <Link to="/best-selling">
                  <button className="group px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-white font-bold rounded-xl border-2 border-purple-400/30 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:scale-105">
                    <span className="flex items-center gap-2">
                      {banner.secondaryButtonText || "View Collections"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="  grid grid-cols-3 gap-6 pt-6 mt-8 border-t border-purple-400/20">
                <div className="text-center  items-center">
                  <div className="flex justify-center  mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {banner.stats?.customers?.count || "10K+"}
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    {banner.stats?.customers?.label || "Happy Customers"}
                  </div>
                </div>
                <div className="text-center ">
                  <div className="flex justify-center  mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {banner.stats?.products?.count || "5K+"}
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    {banner.stats?.products?.label || "Products"}
                  </div>
                </div>
                <div className="text-center ">
                  <div className="flex justify-center  first-letter mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    {banner.stats?.satisfaction?.count || "99%"}
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    {banner.stats?.satisfaction?.label || "Satisfaction"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="flex-shrink-0">
              {loading ? (
                <div className="w-[320px] h-[240px] md:w-[400px] md:h-[300px] lg:w-[400px] lg:h-[360px] bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl flex items-center justify-center shadow-2xl border border-purple-400/20 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400/30 border-t-cyan-400"></div>
                    <span className="text-cyan-400 font-medium">Loading...</span>
                  </div>
                </div>
              ) : banner.displayMode === "sliding" &&
                banner.images &&
                banner.images.length > 0 ? (
                <div className="w-[320px] h-[240px] md:w-[400px] md:h-[300px] lg:w-[400px] lg:h-[360px] rounded-3xl overflow-hidden shadow-2xl border border-purple-400/20">
                  <SlidingBanner banner={banner} />
                </div>
              ) : (
                <div className="relative w-[320px] h-[240px] md:w-[400px] md:h-[300px] lg:w-[400px] lg:h-[360px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 shadow-2xl border border-purple-400/20 backdrop-blur-sm">
                  <img
                    src={getImageUrl(banner.image)}
                    alt="Banner"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    key={`banner-image-${banner._imageRefresh || Date.now()}`}
                    onError={(e) => {
                      e.target.src =
                        "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";
                    }}
                  />
                  {/* Overlay Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/20 to-transparent flex flex-col justify-end p-6">
                    <div className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 backdrop-blur-sm rounded-2xl p-4 border border-cyan-400/30">
                      <span className="text-white text-lg font-bold block mb-1">
                        Coming Soon
                      </span>
                      <span className="text-cyan-100 text-sm">
                        Site under Construction
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default Hero;
