import React, { useState } from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
  AiOutlineMail,
  AiOutlineCheck,
  AiFillLinkedin,
} from "react-icons/ai";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineSupport,
  HiOutlineStar,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { footerProductLinks, footerSupportLinks } from "../../static/data";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { settings: siteSettings } = useSiteSettings();

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${server}/newsletter/subscribe`, {
        email: email,
      });

      if (response.data.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(
          response.data.message ||
            "Successfully subscribed to our newsletter! 🎉"
        );

        // Reset success state after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to top when navigating to new pages
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Newsletter Section - Simple Design */}
      <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 lg:py-4">
        <div className=" max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between">
          <div className="text-start py-1">
            <h2 className="text-[17px] lg:text-2xl font-bold text-white mb-3 animate-fade-in">
              🏝️ Stay Connected with Mall of Cayman
            </h2>
            <p className="text-white/90 text-sm lg:text-[16px] max-w-3xl mb-3 mx-auto animate-fade-in-delay">
              Get exclusive deals, new store announcements, and island updates delivered to your inbox
            </p>
          </div>

          <div className=" max-w-md mx-auto animate-slide-up flex align-center">
            <form onSubmit={handleSubscribe} className="flex flex-wrap items-center gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 w-3/4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60 shadow-lg"
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="px-4 py-2 bg-blue-100 text-red-500 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-80 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                ) : isSubscribed ? (
                  <AiOutlineCheck className="w-5 h-5 text-green-600" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Simple Design */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Company Info */}
            <div className="space-y-6 animate-fade-in">
              <Link to="/" className="inline-block group">
                <img
                  src="/logo (10).png"
                  alt="Mall of Cayman"
                  className="h-16 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <p className="text-gray-300 text-sm leading-relaxed">
                {siteSettings?.companyInfo?.description ||
                  "Your premier virtual mall marketplace serving businesses across the Cayman Islands. Discover, shop, and connect with local vendors."}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3 group hover:text-white transition-colors">
                  <HiOutlineLocationMarker className="w-4 h-4 text-primary-400 mt-1 group-hover:text-primary-300" />
                  <span className="text-gray-300">
                    {(siteSettings?.footerAddress?.streetAddress && (
                      <>
                        {siteSettings.footerAddress.streetAddress}
                        {siteSettings.footerAddress.landmark &&
                          `, ${siteSettings.footerAddress.landmark}`}
                        <br />
                        {siteSettings.footerAddress.city &&
                          `${siteSettings.footerAddress.city}`}
                        {siteSettings.footerAddress.postalCode &&
                          ` ${siteSettings.footerAddress.postalCode}`}
                      </>
                    )) ||
                      "George Town, Grand Cayman, Cayman Islands"}
                  </span>
                </div>

                <div className="flex items-center space-x-3 group hover:text-white transition-colors">
                  <HiOutlinePhone className="w-4 h-4 text-primary-400 group-hover:text-primary-300" />
                  <span className="text-gray-300">
                    {siteSettings?.footerAddress?.phone || "+1 (345) 000-0000"}
                  </span>
                </div>

                <div className="flex items-center space-x-3 group hover:text-white transition-colors">
                  <AiOutlineMail className="w-4 h-4 text-primary-400 group-hover:text-primary-300" />
                  <span className="text-gray-300">
                    {siteSettings?.footerAddress?.email ||
                      "info@mallofcayman.ky"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shop Links */}
            <div className="animate-fade-in-delay-1">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Shop
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              </h3>
              <ul className="space-y-3">
                {footerProductLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.link}
                      onClick={scrollToTop}
                      className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="animate-fade-in-delay-2">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/products"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                    Departments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                    Deals & Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop-create"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                    Become a Seller
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Social */}
            <div className="animate-fade-in-delay-3">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Support
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              </h3>
              <ul className="space-y-3 mb-8">
                {footerSupportLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.link}
                      onClick={scrollToTop}
                      className="text-gray-300 hover:text-white hover:pl-3 transition-all duration-300 text-sm block py-1 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              
            </div>

            <div className="animate-fade-in-delay-3">
              {/* Social Media */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-3">
                  {[
                    {
                      icon: AiFillFacebook,
                      color: "hover:bg-blue-600",
                      link: siteSettings?.socialMedia?.facebook || "https://facebook.com",
                      show: siteSettings?.socialMedia?.facebook || true,
                    },
                    {
                      icon: AiOutlineTwitter,
                      color: "hover:bg-sky-500",
                      link: siteSettings?.socialMedia?.twitter || "https://twitter.com",
                      show: siteSettings?.socialMedia?.twitter || true,
                    },
                    {
                      icon: AiFillInstagram,
                      color: "hover:bg-pink-600",
                      link: siteSettings?.socialMedia?.instagram || "https://instagram.com",
                      show: siteSettings?.socialMedia?.instagram || true,
                    },
                    {
                      icon: AiFillLinkedin,
                      color: "hover:bg-blue-700",
                      link: siteSettings?.socialMedia?.linkedin || "",
                      show: !!siteSettings?.socialMedia?.linkedin,
                    },
                    {
                      icon: AiFillYoutube,
                      color: "hover:bg-red-600",
                      link: siteSettings?.socialMedia?.youtube || "https://youtube.com",
                      show: siteSettings?.socialMedia?.youtube || true,
                    },
                  ]
                    .filter((social) => social.show && social.link)
                    .map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-700 ${social.color} rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1`}
                      >
                        <social.icon className="w-5 h-5 text-white" />
                      </a>
                    ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <HiOutlineShieldCheck className="w-4 h-4 text-green-400" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <HiOutlineTruck className="w-4 h-4 text-blue-400" />
                  <span>Island-Wide Delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <HiOutlineSupport className="w-4 h-4 text-purple-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                  <span>Trusted Vendors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Simple Design */}
      <div className="bg-gray-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 animate-fade-in-up">
            
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()}{" "}
                <span className="text-white font-semibold">
                  {siteSettings?.companyInfo?.name || "Mall of Cayman"}
                </span>
                . All rights reserved.
              </p>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <Link
                to="/buyer-terms"
                onClick={scrollToTop}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                User Terms
              </Link>
              <Link
                to="/seller-terms"
                onClick={scrollToTop}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Vendor Terms
              </Link>
              <Link
                to="/privacy"
                onClick={scrollToTop}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/refund"
                onClick={scrollToTop}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Return & Refund
              </Link>
            </div>

            {/* Made in Cayman */}
            <div className="flex items-center space-x-2">
              <span className="text-xl animate-bounce">🏝️</span>
              <span className="text-gray-400 text-sm">
                Made in <span className="text-white font-semibold">Cayman Islands</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-delay-1 {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.6s both;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
