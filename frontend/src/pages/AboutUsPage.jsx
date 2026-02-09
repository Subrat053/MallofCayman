import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useLegalPage } from "../hooks/useLegalPage";
import { useSiteSettings } from "../hooks/useSiteSettings";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineHeart,
  HiOutlineGlobe,
  HiOutlineGift,
} from "react-icons/hi";
import { AiOutlineRocket, AiOutlineAim, AiOutlineEye } from "react-icons/ai";

const AboutUsPage = () => {
  const { legalPage, loading, error } = useLegalPage("about-us");
  const { settings: siteSettings } = useSiteSettings();

  // Get contact info from site settings
  const contactInfo = {
    address: siteSettings?.footerAddress?.streetAddress
      ? `${siteSettings.footerAddress.streetAddress}, ${siteSettings.footerAddress.city} ${siteSettings.footerAddress.postalCode}`
      : "Contact address not set",
    phone: siteSettings?.footerAddress?.phone || "Phone not set",
    email: siteSettings?.footerAddress?.email || "Email not set",
  };

  const companyName =
    siteSettings?.companyInfo?.name ||
    siteSettings?.branding?.siteTitle ||
    "Our Company";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading spinner while fetching legal page content
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header activeHeading={2} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-indigo-600 mx-auto mb-6 shadow-lg"></div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
              <p className="text-slate-700 text-lg font-medium">Loading About Us content...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If admin has created custom About Us content, show it
  if (legalPage && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header activeHeading={2} />

        {/* Dynamic Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 py-24 lg:py-32 overflow-hidden">
          {/* Background Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:20px_20px] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-purple-900/20"></div>
          
          {/* Floating Orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  {legalPage.title}
                </span>
              </h1>
              {legalPage.metaDescription && (
                <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed mb-10 px-4">
                  {legalPage.metaDescription}
                </p>
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center px-4">
              <Link
                to="/products"
                className="group w-full sm:w-auto px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Products
                  <HiOutlineShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Link>
              <Link
                to="/shop-create"
                className="group w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/80 text-white font-bold rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm hover:border-white"
              >
                <span className="flex items-center justify-center gap-2">
                  Become a Seller
                  <AiOutlineRocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Our Story Section */}
          <section className="py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 lg:pr-8">
                <div className="inline-block">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Our Story
                    <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mt-4 rounded-full"></div>
                  </h2>
                </div>
                <div className="space-y-6 text-base lg:text-lg text-slate-600 leading-relaxed">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-indigo-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                    Founded with a vision to democratize e-commerce, {companyName}{" "}
                    began as a simple idea: create a platform where quality meets
                    affordability, and where every seller, regardless of size, can
                    reach customers worldwide.
                  </p>
                  <p>
                    What started as a small project has evolved into a thriving
                    marketplace that connects thousands of buyers with hundreds of
                    trusted sellers. We believe in the power of technology to
                    break down barriers and create opportunities for businesses of
                    all sizes.
                  </p>
                  <p>
                    Today, {companyName} stands as a testament to innovation,
                    reliability, and customer-centricity. Every feature we build,
                    every partnership we forge, and every customer interaction we
                    have is guided by our commitment to excellence.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src="https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Our+Journey"
                      alt="Our Journey"
                      className="w-full h-64 lg:h-80 object-cover shadow-lg transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="text-center p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">2023</div>
                      <div className="text-sm lg:text-base text-slate-600 font-medium">Founded</div>
                    </div>
                    <div className="text-center p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        India
                      </div>
                      <div className="text-sm lg:text-base text-slate-600 font-medium">Headquarters</div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="py-16 lg:py-24">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                    Mission & Vision
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  <div className="group text-center p-8 lg:p-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:16px_16px] opacity-50"></div>
                    
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                        <AiOutlineAim className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
                        Our Mission
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                        To empower businesses and individuals by providing a seamless,
                        secure, and innovative e-commerce platform that connects
                        quality products with customers worldwide, fostering growth
                        and success for all.
                      </p>
                    </div>
                  </div>

                  <div className="group text-center p-8 lg:p-10 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.1)_1px,transparent_0)] [background-size:16px_16px] opacity-50"></div>
                    
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                        <AiOutlineEye className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
                        Our Vision
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                        To become the world's most trusted and innovative multi-vendor
                        marketplace, where technology meets human connection, creating
                        exceptional value for buyers, sellers, and communities
                        globally.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Content Section */}
          <section className="py-16 lg:py-24">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 lg:p-12">
              <div
                className="prose prose-slate prose-lg lg:prose-xl max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-strong:text-slate-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:rounded prose-code:px-1"
                dangerouslySetInnerHTML={{
                  __html: legalPage.content,
                }}
                style={{
                  lineHeight: "1.7",
                }}
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 lg:py-24">
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 rounded-3xl p-8 lg:p-16 text-white overflow-hidden">
              {/* Background Patterns */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>
              
              {/* Floating Orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
              
              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg lg:text-xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Have questions? We'd love to hear from you. Our team is here to
                  help you succeed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <HiOutlineLocationMarker className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-3">Visit Us</h3>
                    <p className="text-slate-200 text-center leading-relaxed">
                      {contactInfo.address}
                    </p>
                  </div>

                  <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <HiOutlinePhone className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-3">Call Us</h3>
                    <p className="text-slate-200 font-medium">{contactInfo.phone}</p>
                  </div>

                  <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <HiOutlineMail className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-3">Email Us</h3>
                    <p className="text-slate-200 font-medium">{contactInfo.email}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center max-w-md mx-auto">
                  <Link
                    to="/faq"
                    className="group px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    View FAQ
                    <HiOutlineGlobe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/inbox"
                    className="group px-8 py-4 bg-transparent border-2 border-white/80 text-white font-bold rounded-2xl hover:bg-white hover:text-indigo-700 transition-all duration-300 backdrop-blur-sm hover:border-white flex items-center justify-center gap-2"
                  >
                    Contact Support
                    <HiOutlineMail className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    );
  }

  // Fallback to static content if no admin content is available or there's an error
  const teamMembers = [
    {
      name: "Subhankar Dash",
      role: "Founder & CEO",
      image: "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=SD",
      description:
        "Visionary leader with 10+ years in e-commerce and technology innovation.",
    },
    {
      name: "Tech Team",
      role: "Development Team",
      image: "https://via.placeholder.com/300x300/059669/FFFFFF?text=DEV",
      description: "Expert developers creating seamless shopping experiences.",
    },
    {
      name: "Support Team",
      role: "Customer Success",
      image: "https://via.placeholder.com/300x300/DC2626/FFFFFF?text=SUP",
      description:
        "Dedicated support team ensuring customer satisfaction 24/7.",
    },
  ];

  const values = [
    {
      icon: HiOutlineHeart,
      title: "Customer First",
      description:
        "Every decision we make puts our customers at the center. Your satisfaction is our success.",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Trust & Security",
      description:
        "We prioritize the security of your data and transactions with industry-leading protection.",
    },
    {
      icon: AiOutlineRocket,
      title: "Innovation",
      description:
        "Constantly evolving with cutting-edge technology to enhance your shopping experience.",
    },
    {
      icon: HiOutlineGlobe,
      title: "Global Reach",
      description:
        "Connecting buyers and sellers worldwide, breaking down geographical barriers.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers", icon: HiOutlineUsers },
    { number: "500+", label: "Trusted Sellers", icon: HiOutlineShoppingBag },
    { number: "50K+", label: "Products", icon: HiOutlineGift },
    { number: "99.9%", label: "Uptime", icon: HiOutlineTruck },
  ];

  // Render fallback static content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header activeHeading={2} />

      {/* Error Message if there was an issue loading admin content */}
      {error && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 mx-4 mt-4 rounded-r-2xl shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-800">
                Unable to load custom About Us content. Showing default content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 py-24 lg:py-32 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-purple-900/20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                About {companyName}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed mb-10 px-4">
              {siteSettings?.companyInfo?.description ||
                "Your premier destination for quality products from trusted sellers worldwide. We're revolutionizing e-commerce with innovation, trust, and exceptional service."}
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center px-4">
            <Link
              to="/products"
              className="group w-full sm:w-auto px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Explore Products
                <HiOutlineShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              to="/shop-create"
              className="group w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/80 text-white font-bold rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm hover:border-white"
            >
              <span className="flex items-center justify-center gap-2">
                Become a Seller
                <AiOutlineRocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Our Story Section */}
        <section className="py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 lg:pr-8">
              <div className="inline-block">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Our Story
                  <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mt-4 rounded-full"></div>
                </h2>
              </div>
              <div className="space-y-6 text-base lg:text-lg text-slate-600 leading-relaxed">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-indigo-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                  Founded with a vision to democratize e-commerce, {companyName}{" "}
                  began as a simple idea: create a platform where quality meets
                  affordability, and where every seller, regardless of size, can
                  reach customers worldwide.
                </p>
                <p>
                  What started as a small project has evolved into a thriving
                  marketplace that connects thousands of buyers with hundreds of
                  trusted sellers. We believe in the power of technology to
                  break down barriers and create opportunities for businesses of
                  all sizes.
                </p>
                <p>
                  Today, {companyName} stands as a testament to innovation,
                  reliability, and customer-centricity. Every feature we build,
                  every partnership we forge, and every customer interaction we
                  have is guided by our commitment to excellence.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src="https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Our+Journey"
                    alt="Our Journey"
                    className="w-full h-64 lg:h-80 object-cover shadow-lg transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent"></div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">2023</div>
                    <div className="text-sm lg:text-base text-slate-600 font-medium">Founded</div>
                  </div>
                  <div className="text-center p-4 lg:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      India
                    </div>
                    <div className="text-sm lg:text-base text-slate-600 font-medium">Headquarters</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 lg:py-24">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-20">
            <div className="p-8 lg:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Mission & Vision
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="group text-center p-8 lg:p-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:16px_16px] opacity-50"></div>
                  
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                      <AiOutlineAim className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
                      Our Mission
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                      To empower businesses and individuals by providing a seamless,
                      secure, and innovative e-commerce platform that connects
                      quality products with customers worldwide, fostering growth
                      and success for all.
                    </p>
                  </div>
                </div>

                <div className="group text-center p-8 lg:p-10 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.1)_1px,transparent_0)] [background-size:16px_16px] opacity-50"></div>
                  
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                      <AiOutlineEye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
                      Our Vision
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                      To become the world's most trusted and innovative multi-vendor
                      marketplace, where technology meets human connection, creating
                      exceptional value for buyers, sellers, and communities
                      globally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 lg:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Growing Together
              <div className="w-28 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our success is measured by the success of our community and the meaningful connections we create
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <stat.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-semibold text-sm lg:text-base">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Our Core Values
              <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The fundamental principles that guide every decision we make and define who we are
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group text-center p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl group-hover:blur-lg transition-all duration-500"></div>
                
                <div className="relative">
                  <div className="w-18 h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <value.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-6">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 lg:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Meet Our Team
              <div className="w-28 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The passionate and dedicated people behind {companyName}'s continued success and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group text-center p-8 lg:p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Background decorations */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="relative mb-8">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 lg:w-36 lg:h-36 rounded-3xl mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 via-transparent to-transparent rounded-3xl"></div>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">
                    {member.name}
                  </h3>
                  <div className="text-indigo-600 font-semibold mb-6 text-base lg:text-lg">
                    {member.role}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-24">
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 rounded-3xl p-8 lg:p-16 text-white overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>
            
            {/* Floating Orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Get in Touch
              </h2>
              <p className="text-lg lg:text-xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                Have questions? We'd love to hear from you. Our team is here to
                help you succeed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineLocationMarker className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3">Visit Us</h3>
                  <p className="text-slate-200 text-center leading-relaxed">
                    {contactInfo.address}
                  </p>
                </div>

                <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlinePhone className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3">Call Us</h3>
                  <p className="text-slate-200 font-medium">{contactInfo.phone}</p>
                </div>

                <div className="group flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineMail className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3">Email Us</h3>
                  <p className="text-slate-200 font-medium">{contactInfo.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center max-w-md mx-auto">
                <Link
                  to="/faq"
                  className="group px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  View FAQ
                  <HiOutlineGlobe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
                <Link
                  to="/inbox"
                  className="group px-8 py-4 bg-transparent border-2 border-white/80 text-white font-bold rounded-2xl hover:bg-white hover:text-indigo-700 transition-all duration-300 backdrop-blur-sm hover:border-white flex items-center justify-center gap-2"
                >
                  Contact Support
                  <HiOutlineMail className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
