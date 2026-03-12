import React from "react";
import { useParams } from "react-router-dom";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import ShopVideoBanners from "../../components/Shop/ShopVideoBanners";
import ShopCustomContent from "../../components/Shop/ShopCustomContent";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const ShopPreviewPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Shop Info Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <ShopInfo isOwner={false} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Custom HTML/CSS Content (Gold Plan Feature) */}
            <ShopCustomContent shopId={id} />

            {/* Shop Video Banners */}
            <ShopVideoBanners />

            {/* Shop Profile Data */}
            <ShopProfileData isOwner={false} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPreviewPage;
