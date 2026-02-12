import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../../server";
import { AiOutlineStar, AiOutlineShop } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const FeaturedAdvertisedStores = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Number of items to show at a time based on screen size
  const getItemsPerView = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  // Update items per view on resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchFeaturedStores();
  }, []);

  const fetchFeaturedStores = async () => {
    try {
      const { data } = await axios.get(
        `${server}/advertisement/active/featured_store`
      );

      if (data.success && data.advertisements?.length > 0) {
        setFeaturedStores(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching featured stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = async (ad) => {
    // Track click
    try {
      await axios.post(`${server}/advertisement/track-click/${ad._id}`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Navigate to next set
  const goToNext = useCallback(() => {
    if (featuredStores.length <= itemsPerView) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const nextIndex = prev + itemsPerView;
      return nextIndex >= featuredStores.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredStores.length, itemsPerView]);

  // Navigate to previous set
  const goToPrevious = useCallback(() => {
    if (featuredStores.length <= itemsPerView) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const prevIndex = prev - itemsPerView;
      return prevIndex < 0
        ? Math.max(0, featuredStores.length - itemsPerView)
        : prevIndex;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredStores.length, itemsPerView]);

  // Auto-scroll every 10 seconds
  useEffect(() => {
    if (featuredStores.length <= itemsPerView || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [featuredStores.length, itemsPerView, isPaused, goToNext]);

  // Get visible stores
  const visibleStores = featuredStores.slice(
    currentIndex,
    currentIndex + itemsPerView
  );
  // If we don't have enough stores at the end, wrap around
  const displayStores =
    visibleStores.length < itemsPerView && featuredStores.length > itemsPerView
      ? [
          ...visibleStores,
          ...featuredStores.slice(0, itemsPerView - visibleStores.length),
        ]
      : visibleStores;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-200 h-48 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (featuredStores.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-orange-400 shadow-lg">
            <AiOutlineShop className="w-7 h-7 text-white" />
          </span>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">Featured Stores</h2>
            <p className="text-sm text-gray-500 font-medium">Premium vendor spotlight</p>
          </div>
        </div>
        <span className="inline-block px-4 py-1 bg-gradient-to-r from-emerald-500 to-orange-400 text-white text-xs font-bold rounded-full shadow-md tracking-widest uppercase">Sponsored</span>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        {featuredStores.length > itemsPerView && (
          <>
            <button
              onClick={goToPrevious}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white/80 hover:bg-emerald-100 border border-emerald-200 rounded-full p-3 shadow-lg transition-colors"
              aria-label="Previous stores"
            >
              <HiChevronLeft className="w-6 h-6 text-emerald-600" />
            </button>
            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white/80 hover:bg-orange-100 border border-orange-200 rounded-full p-3 shadow-lg transition-colors"
              aria-label="Next stores"
            >
              <HiChevronRight className="w-6 h-6 text-orange-600" />
            </button>
          </>
        )}

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-500 ${
            isTransitioning ? "opacity-60" : "opacity-100"
          }`}
        >
          {displayStores.map((ad) => (
            <Link
              key={ad._id}
              to={ad.linkUrl}
              onClick={() => handleStoreClick(ad)}
              className="group flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-400 transition-all duration-300 overflow-hidden relative"
            >
              {/* Store Avatar/Logo */}
              <div className="relative h-36 bg-gradient-to-br from-emerald-100 to-orange-100 flex items-center justify-center">
                {ad.shopId?.avatar?.url ? (
                  <img
                    src={ad.shopId.avatar.url}
                    alt={ad.shopId.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-xl">
                    <AiOutlineShop className="w-12 h-12 text-emerald-400" />
                  </div>
                )}
                {/* Featured Badge */}
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400/90 text-yellow-900 text-[11px] font-bold rounded-full shadow">
                    <AiOutlineStar className="w-4 h-4" />
                    FEATURED
                  </span>
                </div>
              </div>

              {/* Store Info */}
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                    {ad.shopId?.name || ad.title}
                  </h3>
                  {ad.shopId?.verified && (
                    <MdVerified className="w-5 h-5 text-orange-500 flex-shrink-0 ml-2" />
                  )}
                </div>

                {ad.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {ad.description}
                  </p>
                )}

                {/* Store Stats */}
                {ad.shopId && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    {ad.shopId.ratings && (
                      <div className="flex items-center gap-1">
                        <AiOutlineStar className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">
                          {ad.shopId.ratings.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {ad.shopId.productsCount && (
                      <span className="text-orange-600">{ad.shopId.productsCount} products</span>
                    )}
                  </div>
                )}

                {/* Visit Button */}
                <button className="mt-auto w-full py-2 bg-gradient-to-r from-emerald-500 to-orange-500 text-white text-xs font-bold rounded-lg group-hover:from-emerald-600 group-hover:to-orange-600 shadow transition-all">
                  Visit Store <span aria-hidden>→</span>
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Dots */}
        {featuredStores.length > itemsPerView && (
          <div className="flex justify-center items-center mt-6 gap-2">
            {Array.from({
              length: Math.ceil(featuredStores.length / itemsPerView),
            }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentIndex(idx * itemsPerView);
                  setTimeout(() => setIsTransitioning(false), 500);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === idx
                    ? "bg-emerald-500 w-5"
                    : "bg-gray-300 hover:bg-orange-400"
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
            <span className="ml-3 text-xs text-gray-400 hidden sm:inline-block">
              Auto-scrolls every 10s
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAdvertisedStores;
