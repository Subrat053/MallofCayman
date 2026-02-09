import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { Link } from "react-router-dom";

const ShopAdvertisementDisplay = ({ shopId, adType, className = "" }) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchActiveAds();
    }
  }, [shopId, adType]);

  // Carousel rotation every 10 seconds
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchActiveAds = async () => {
    try {
      setLoading(true);
      let url = `${server}/store-manager-advertisement/shop/${shopId}/active`;
      if (adType) {
        url += `?adType=${adType}`;
      }
      const { data } = await axios.get(url);
      if (data.success) {
        setAds(data.advertisements || []);
      }
    } catch (error) {
      console.error("Error fetching shop ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (adId) => {
    try {
      await axios.post(
        `${server}/store-manager-advertisement/track/view/${adId}`,
      );
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const trackClick = async (adId) => {
    try {
      await axios.post(
        `${server}/store-manager-advertisement/track/click/${adId}`,
      );
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Track view when ad is displayed
  useEffect(() => {
    if (ads.length > 0 && ads[currentAdIndex]) {
      trackView(ads[currentAdIndex]._id);
    }
  }, [currentAdIndex, ads]);

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Different styles based on ad type
  const getAdStyles = () => {
    switch (adType || currentAd?.adType) {
      case "store_banner":
        return "w-full h-[120px] max-w-[728px] mx-auto";
      case "store_sidebar":
        return "w-[300px] h-[200px]";
      case "product_highlight":
        return "w-full max-w-md mx-auto";
      case "store_announcement":
        return "w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg";
      case "seasonal_promo":
      case "clearance_sale":
        return "w-full h-[120px] max-w-[728px] mx-auto";
      case "new_arrival":
      case "flash_deal":
        return "w-[300px] h-[200px]";
      default:
        return "w-full max-w-[728px] mx-auto";
    }
  };

  const handleAdClick = () => {
    trackClick(currentAd._id);
  };

  // Render announcement-style ad (text-based)
  if (currentAd?.adType === "store_announcement") {
    return (
      <div className={`${getAdStyles()} ${className}`}>
        <Link to={currentAd.linkUrl} onClick={handleAdClick} className="block">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-sm opacity-90 mt-1">
                  {currentAd.description}
                </p>
              )}
            </div>
            <span className="text-2xl">📢</span>
          </div>
        </Link>
        {ads.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render product highlight
  if (currentAd?.adType === "product_highlight" && currentAd.productId) {
    const product = currentAd.productId;
    return (
      <div
        className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-semibold text-orange-600">
            Featured Product
          </span>
        </div>
        <Link
          to={currentAd.linkUrl}
          onClick={handleAdClick}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          {product.images?.[0]?.url && (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div>
            <h4 className="font-semibold text-gray-800">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              {product.discountPrice ? (
                <>
                  <span className="text-lg font-bold text-orange-600">
                    ${product.discountPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-800">
                  ${product.price}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Render image/video-based ad
  return (
    <div
      className={`relative ${getAdStyles()} ${className} overflow-hidden rounded-lg`}
    >
      <Link
        to={currentAd.linkUrl}
        onClick={handleAdClick}
        className="block w-full h-full"
      >
        {currentAd.mediaType === "video" && currentAd.video?.url ? (
          <video
            src={currentAd.video.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : currentAd.image?.url ? (
          <img
            src={currentAd.image.url}
            alt={currentAd.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500">{currentAd.title}</span>
          </div>
        )}

        {/* Ad overlay with title */}
        {currentAd.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h4 className="text-white font-semibold text-sm">
              {currentAd.title}
            </h4>
          </div>
        )}
      </Link>

      {/* Carousel indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentAdIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Ad badge */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
        AD
      </div>
    </div>
  );
};

// Wrapper components for specific ad types
export const ShopBannerAd = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="store_banner"
    className={className}
  />
);

export const ShopSidebarAd = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="store_sidebar"
    className={className}
  />
);

export const ShopAnnouncementAd = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="store_announcement"
    className={className}
  />
);

export const ShopProductHighlight = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="product_highlight"
    className={className}
  />
);

export const ShopFlashDeal = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="flash_deal"
    className={className}
  />
);

export const ShopNewArrival = ({ shopId, className }) => (
  <ShopAdvertisementDisplay
    shopId={shopId}
    adType="new_arrival"
    className={className}
  />
);

export default ShopAdvertisementDisplay;
