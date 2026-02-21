import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { server } from "../server";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineAdjustments,
} from "react-icons/hi";
import {
  MdOutlineBedroomParent,
  MdOutlineBathroom,
  MdOutlineSquareFoot,
  MdOutlineGarage,
} from "react-icons/md";
import { BsBuilding, BsHouseDoor, BsTagFill } from "react-icons/bs";
import { FaRegBuilding } from "react-icons/fa";

// ─── Constants ────────────────────────────────────────────────────────────────
const LISTING_TYPES = [
  { value: "all", label: "All" },
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "villa", label: "Villa" },
  { value: "commercial", label: "Commercial" },
  { value: "office", label: "Office" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "other", label: "Other" },
];

const BEDROOM_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

const STATUS_COLORS = {
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Available" },
  sold: { bg: "bg-red-100", text: "text-red-700", label: "Sold" },
  rented: { bg: "bg-orange-100", text: "text-orange-700", label: "Rented" },
};

const LISTING_TAG = {
  sale: { bg: "bg-blue-600", label: "For Sale" },
  rent: { bg: "bg-purple-600", label: "For Rent" },
};

// ─── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ property }) => {
  const tag = LISTING_TAG[property.listingType] || LISTING_TAG.sale;
  const status = STATUS_COLORS[property.status] || STATUS_COLORS.active;
  const mainImage =
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1 border border-gray-100">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        {/* Listing type tag */}
        <span
          className={`absolute top-3 left-3 ${tag.bg} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}
        >
          {tag.label}
        </span>
        {/* Status badge */}
        {property.status !== "active" && (
          <span
            className={`absolute top-3 right-3 ${status.bg} ${status.text} text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {status.label}
          </span>
        )}
        {property.isFeatured && (
          <span className="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
            ★ Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xl font-bold text-blue-700">
            ${Number(property.price).toLocaleString()}
            {property.listingType === "rent" && (
              <span className="text-sm font-normal text-gray-500">
                {property.priceLabel ? ` ${property.priceLabel}` : "/mo"}
              </span>
            )}
          </p>
          <span className="text-xs text-gray-400 tracking-wide capitalize">
            {property.propertyType}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span className="truncate">
            {[property.location?.address, property.location?.city]
              .filter(Boolean)
              .join(", ") || "Cayman Islands"}
          </span>
        </p>

        {/* Short description */}
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {property.description}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-gray-600 text-sm border-t border-gray-100 pt-3 mb-4">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <MdOutlineBedroomParent className="w-4 h-4 text-blue-400" />
              {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <MdOutlineBathroom className="w-4 h-4 text-blue-400" />
              {property.bathrooms} Bath
            </span>
          )}
          {property.sqft > 0 && (
            <span className="flex items-center gap-1">
              <MdOutlineSquareFoot className="w-4 h-4 text-blue-400" />
              {Number(property.sqft).toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/real-estate/${property.slug}`}
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const PropertySkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
    <div className="h-52 bg-gray-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-7 bg-gray-200 rounded w-1/2"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="flex gap-3">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const RealEstatePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    listingType: "all",
    propertyType: "all",
    bedrooms: "any",
    minPrice: "",
    maxPrice: "",
    city: "",
    search: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  const fetchProperties = useCallback(
    async (page = 1, filtersToUse = appliedFilters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 9 });
        if (filtersToUse.listingType !== "all")
          params.append("listingType", filtersToUse.listingType);
        if (filtersToUse.propertyType !== "all")
          params.append("propertyType", filtersToUse.propertyType);
        if (filtersToUse.bedrooms !== "any")
          params.append("bedrooms", filtersToUse.bedrooms);
        if (filtersToUse.minPrice) params.append("minPrice", filtersToUse.minPrice);
        if (filtersToUse.maxPrice) params.append("maxPrice", filtersToUse.maxPrice);
        if (filtersToUse.city) params.append("city", filtersToUse.city);
        if (filtersToUse.search) params.append("search", filtersToUse.search);

        const { data } = await axios.get(
          `${server}/property/get-properties?${params.toString()}`
        );
        setProperties(data.properties || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters]
  );

  useEffect(() => {
    fetchProperties(1, appliedFilters);
    // eslint-disable-next-line
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    const reset = {
      listingType: "all",
      propertyType: "all",
      bedrooms: "any",
      minPrice: "",
      maxPrice: "",
      city: "",
      search: "",
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchProperties(page, appliedFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = [
    appliedFilters.listingType !== "all",
    appliedFilters.propertyType !== "all",
    appliedFilters.bedrooms !== "any",
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
    appliedFilters.city,
  ].filter(Boolean).length;

  // ─── Filter Panel ────────────────────────────────────────────────────────────
  const FilterPanel = ({ mobile = false }) => (
    <div className={mobile ? "p-4" : "bg-white rounded-2xl shadow-sm border border-gray-100 p-6"}>
      {!mobile && (
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <HiOutlineAdjustments className="w-5 h-5 text-blue-600" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-red-500 hover:text-red-700 font-medium underline"
            >
              Reset All
            </button>
          )}
        </div>
      )}

      <div className={`space-y-5 ${mobile ? "" : ""}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Title, location..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* For Sale / Rent */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Listing Type
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {LISTING_TYPES.map((lt) => (
              <button
                key={lt.value}
                onClick={() => setFilters((f) => ({ ...f, listingType: lt.value }))}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  filters.listingType === lt.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) =>
              setFilters((f) => ({ ...f, propertyType: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price Range ($)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {BEDROOM_OPTIONS.map((b) => (
              <button
                key={b.value}
                onClick={() => setFilters((f) => ({ ...f, bedrooms: b.value }))}
                className={`flex-1 py-2 text-xs font-semibold transition-all ${
                  filters.bedrooms === b.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City / Location
          </label>
          <div className="relative">
            <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="e.g. George Town"
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyFilters}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          Apply Filters
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl transition-all text-sm"
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeHeading={9} />

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-indigo-900/90"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <HiOutlineHome className="w-4 h-4" />
            Real Estate — Cayman Islands
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Find Your Perfect
            <span className="block text-blue-300">Property in Cayman</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            Explore premium lands, homes, and commercial properties. Submit an inquiry
            and our team will connect with you directly.
          </p>

          {/* Quick search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location, title..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  className="w-full pl-10 pr-4 py-3 text-gray-800 rounded-xl focus:outline-none text-sm bg-transparent"
                />
              </div>
              <button
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 text-sm text-blue-200">
            <span>
              <strong className="text-white text-xl block">{total}+</strong>
              Properties
            </span>
            <span>
              <strong className="text-white text-xl block">100%</strong>
              Verified
            </span>
            <span>
              <strong className="text-white text-xl block">24/7</strong>
              Support
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Mobile filter toggle */}
        <div className="lg:hidden flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            <strong className="text-gray-900">{total}</strong> properties found
          </p>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm text-sm font-medium"
          >
            <HiOutlineFilter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sidebar Filters (Desktop) ──────────────────────────────────── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* ─── Properties Grid ────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeFilterCount > 0 ? "Filtered Properties" : "All Properties"}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {total} {total === 1 ? "property" : "properties"} found
                </p>
              </div>
              {activeFilterCount > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <PropertySkeleton key={i} />
                  ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                  <HiOutlineHome className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === currentPage
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── Mobile Filters Drawer ─────────────────────────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel mobile />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RealEstatePage;
