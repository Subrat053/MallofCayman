import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { server } from "../server";
import { toast } from "react-toastify";
import {
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineShare,
  HiOutlineEye,
} from "react-icons/hi";
import {
  MdOutlineBedroomParent,
  MdOutlineBathroom,
  MdOutlineSquareFoot,
  MdOutlineGarage,
} from "react-icons/md";
import { BsCalendar3, BsTagFill } from "react-icons/bs";

// ─── Constants ────────────────────────────────────────────────────────────────
const LISTING_TAG = {
  sale: { bg: "bg-blue-600", text: "For Sale" },
  rent: { bg: "bg-purple-600", text: "For Rent" },
};

const STATUS_COLORS = {
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Available" },
  sold: { bg: "bg-red-100", text: "text-red-700", label: "Sold" },
  rented: { bg: "bg-orange-100", text: "text-orange-700", label: "Rented" },
};

// ─── Thank You Popup ──────────────────────────────────────────────────────────
const ThankYouPopup = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    ></div>
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
      >
        <HiOutlineX className="w-5 h-5" />
      </button>
      {/* Icon */}
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <HiOutlineCheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Thank You!
      </h2>
      <p className="text-gray-600 mb-2 text-base leading-relaxed">
        Your inquiry has been submitted successfully.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Our team will review your request and reach out to you within{" "}
        <strong>24-48 hours</strong> via phone or email.
      </p>
      <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
        <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
          A confirmation email has been sent to your email address.
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
      >
        Got it!
      </button>
    </div>
  </div>
);

// ─── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const allImages = images?.length > 0 ? images : [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80" },
  ];

  const prev = () => setCurrent((c) => (c - 1 + allImages.length) % allImages.length);
  const next = () => setCurrent((c) => (c + 1) % allImages.length);

  return (
    <>
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100 cursor-pointer" onClick={() => setLightbox(true)}>
        <img
          src={allImages[current]?.url}
          alt={`Property image ${current + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
            >
              <HiOutlineChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
            >
              <HiOutlineChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-blue-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
          <button onClick={prev} className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full">
            <HiOutlineChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={allImages[current]?.url}
            alt="Lightbox"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          />
          <button onClick={next} className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full">
            <HiOutlineChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {current + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Contact Form ─────────────────────────────────────────────────────────────
const ContactForm = ({ propertyId, propertyTitle }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    inquiryType: "details",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.post(`${server}/property/submit-lead`, {
        ...form,
        propertyId,
      });
      setShowThankYou(true);
      setForm({ name: "", phone: "", email: "", message: "", inquiryType: "details" });
      setErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showThankYou && <ThankYouPopup onClose={() => setShowThankYou(false)} />}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <h3 className="text-white font-bold text-lg">Interested in this property?</h3>
          <p className="text-blue-100 text-sm mt-1">
            Fill the form and our agent will contact you
          </p>
        </div>

        <div className="p-6">
          {/* Inquiry type toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, inquiryType: "details" }))}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                form.inquiryType === "details"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              Request Details
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, inquiryType: "visit" }))}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                form.inquiryType === "visit"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              Schedule Visit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (345) 000-0000"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder={
                  form.inquiryType === "visit"
                    ? "When would you like to schedule a visit?"
                    : "I'm interested in this property. Please send me more details..."
                }
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.message ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : form.inquiryType === "visit" ? (
                "Schedule a Visit"
              ) : (
                "Request Details"
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              🔒 Your information is secure and will not be shared.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${server}/property/get-property/${slug}`
        );
        setProperty(data.property);
      } catch (err) {
        // Inject dummy data for demo/testing if API fails
        setProperty({
          _id: "dummy123",
          title: "Luxury Beachfront Villa",
          slug: "luxury-beachfront-villa",
          description: "Experience the ultimate in luxury living with this stunning beachfront villa, offering panoramic ocean views, private pool, and direct beach access. Perfect for family getaways or entertaining guests.",
          price: 2250000,
          priceLabel: "",
          listingType: "sale",
          propertyType: "villa",
          sqft: 4200,
          bedrooms: 5,
          bathrooms: 4,
          garage: 2,
          location: {
            address: "123 Ocean Drive",
            city: "Seven Mile Beach",
            district: "West Bay",
            country: "Cayman Islands",
            zipCode: "KY1-1202",
            latitude: 19.3422,
            longitude: -81.3857,
          },
          images: [
            { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80" },
            { url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=1200&q=80" },
            { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80" },
          ],
          features: [
            "Private Pool",
            "Ocean View",
            "Furnished",
            "Smart Home System",
            "Gated Community",
            "Outdoor Kitchen",
            "Home Theater",
            "Solar Panels",
          ],
          status: "active",
          isFeatured: true,
          isActive: true,
          views: 128,
          createdAt: new Date().toISOString(),
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-4"></div>
              <div className="flex gap-2 mb-6">
                {[1,2,3].map(i => <div key={i} className="w-20 h-16 bg-gray-200 rounded-lg"></div>)}
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
            <HiOutlineHome className="w-10 h-10 text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "This property does not exist or has been removed."}</p>
          <Link to="/real-estate" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Browse Properties
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tag = LISTING_TAG[property.listingType] || LISTING_TAG.sale;
  const status = STATUS_COLORS[property.status] || STATUS_COLORS.active;
  const locationStr = [property.location?.address, property.location?.city, property.location?.district, property.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeHeading={9} />

      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/real-estate" className="hover:text-blue-600 transition-colors">Real Estate</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 text-sm font-medium transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── LEFT: Main Content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <ImageGallery images={property.images} />

            {/* Title & Location */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`${tag.bg} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {tag.text}
                </span>
                <span className={`${status.bg} ${status.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                  {status.label}
                </span>
                {property.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    ★ Featured
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <HiOutlineEye className="w-4 h-4" />
                  {property.views} views
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {property.title}
                  </h1>
                  {locationStr && (
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <HiOutlineLocationMarker className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      {locationStr}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="flex-shrink-0 p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-500 hover:text-blue-600"
                  title="Share"
                >
                  <HiOutlineShare className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Specs bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.bedrooms > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <MdOutlineBedroomParent className="w-7 h-7 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bedrooms</p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <MdOutlineBathroom className="w-7 h-7 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bathrooms</p>
                </div>
              )}
              {property.sqft > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <MdOutlineSquareFoot className="w-7 h-7 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {Number(property.sqft).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Sq Ft</p>
                </div>
              )}
              {property.garage > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
                  <MdOutlineGarage className="w-7 h-7 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.garage}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Garage</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                    >
                      <HiOutlineCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map / Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-6 h-6 text-blue-500" />
                Location
              </h2>
              {locationStr && (
                <p className="text-gray-600 text-sm mb-4">{locationStr}</p>
              )}
              {property.location?.latitude && property.location?.longitude ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 h-64">
                  <iframe
                    title="Property Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`}
                  ></iframe>
                </div>
              ) : property.location?.city ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 h-64">
                  <iframe
                    title="Property Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      [property.location.city, property.location.country || "Cayman Islands"].join(", ")
                    )}&z=13&output=embed`}
                  ></iframe>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Map location not available</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Price Card + Contact Form ──────────────────────────── */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6  top-24">
              <p className="text-3xl font-bold text-blue-700 mb-1">
                ${Number(property.price).toLocaleString()}
                {property.listingType === "rent" && (
                  <span className="text-base font-normal text-gray-500">
                    {property.priceLabel ? ` ${property.priceLabel}` : " /mo"}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-sm mb-5 capitalize">
                {property.propertyType} — {property.listingType === "rent" ? "For Rent" : "For Sale"}
              </p>

              {/* Quick specs */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${status.text} capitalize`}>{status.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{property.propertyType}</span>
                </div>
                {property.sqft > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Area</span>
                    <span className="font-semibold text-gray-800">{Number(property.sqft).toLocaleString()} sqft</span>
                  </div>
                )}
                {property.bedrooms > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bedrooms</span>
                    <span className="font-semibold text-gray-800">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bathrooms</span>
                    <span className="font-semibold text-gray-800">{property.bathrooms}</span>
                  </div>
                )}
                {property.garage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Garage</span>
                    <span className="font-semibold text-gray-800">{property.garage}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Listed</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(property.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Back to listings */}
              <Link
                to="/real-estate"
                className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl transition-all text-sm"
              >
                <HiOutlineArrowLeft className="w-4 h-4" />
                All Properties
              </Link>
            </div>

            {/* Contact Form */}
            <ContactForm propertyId={property._id} propertyTitle={property.title} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
