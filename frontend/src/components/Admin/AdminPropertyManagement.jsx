import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineHome,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { MdOutlineBedroomParent, MdOutlineBathroom, MdOutlineSquareFoot, MdOutlineGarage } from "react-icons/md";

// ─── Constants ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  "house", "apartment", "land", "villa", "commercial", "office", "townhouse", "condo", "other",
];

const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "text-emerald-600 bg-emerald-100" },
  { value: "sold", label: "Sold", color: "text-red-600 bg-red-100" },
  { value: "rented", label: "Rented", color: "text-orange-600 bg-orange-100" },
  { value: "inactive", label: "Inactive", color: "text-gray-600 bg-gray-100" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  priceLabel: "",
  listingType: "sale",
  propertyType: "house",
  sqft: "",
  bedrooms: "",
  bathrooms: "",
  garage: "",
  address: "",
  city: "",
  district: "",
  country: "Cayman Islands",
  zipCode: "",
  latitude: "",
  longitude: "",
  features: [],
  isFeatured: false,
  status: "active",
  newFeature: "",
  images: [], // base64 array
  keepImages: [], // existing image objects
};

// ─── Property Form ─────────────────────────────────────────────────────────────
const PropertyForm = ({ editProperty, onSuccess, onCancel }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]); // {url, isNew, publicId}
  const fileRef = useRef();

  // Populate form when editing
  useEffect(() => {
    if (editProperty) {
      setForm({
        title: editProperty.title || "",
        description: editProperty.description || "",
        price: editProperty.price || "",
        priceLabel: editProperty.priceLabel || "",
        listingType: editProperty.listingType || "sale",
        propertyType: editProperty.propertyType || "house",
        sqft: editProperty.sqft || "",
        bedrooms: editProperty.bedrooms || "",
        bathrooms: editProperty.bathrooms || "",
        garage: editProperty.garage || "",
        address: editProperty.location?.address || "",
        city: editProperty.location?.city || "",
        district: editProperty.location?.district || "",
        country: editProperty.location?.country || "Cayman Islands",
        zipCode: editProperty.location?.zipCode || "",
        latitude: editProperty.location?.latitude || "",
        longitude: editProperty.location?.longitude || "",
        features: editProperty.features || [],
        isFeatured: editProperty.isFeatured || false,
        status: editProperty.status || "active",
        newFeature: "",
        images: [],
        keepImages: editProperty.images || [],
      });
      // Set existing images as previews
      setImagePreview(
        (editProperty.images || []).map((img) => ({
          url: img.url,
          isNew: false,
          publicId: img.publicId,
        }))
      );
    } else {
      setForm(EMPTY_FORM);
      setImagePreview([]);
    }
  }, [editProperty]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview((prev) => [
          ...prev,
          { url: ev.target.result, isNew: true },
        ]);
        setForm((f) => ({ ...f, images: [...f.images, ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    const img = imagePreview[idx];
    setImagePreview((prev) => prev.filter((_, i) => i !== idx));
    if (img.isNew) {
      // Remove from new images array
      let newIdx = -1;
      let count = 0;
      for (let i = 0; i < imagePreview.length; i++) {
        if (imagePreview[i].isNew) {
          if (i === idx) { newIdx = count; break; }
          count++;
        }
      }
      if (newIdx >= 0) {
        setForm((f) => {
          const imgs = [...f.images];
          imgs.splice(newIdx, 1);
          return { ...f, images: imgs };
        });
      }
    } else {
      // Remove from keepImages
      setForm((f) => ({
        ...f,
        keepImages: f.keepImages.filter((ki) => ki.url !== img.url),
      }));
    }
  };

  const addFeature = () => {
    if (form.newFeature.trim()) {
      setForm((f) => ({
        ...f,
        features: [...f.features, f.newFeature.trim()],
        newFeature: "",
      }));
    }
  };

  const removeFeature = (idx) => {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) {
      toast.error("Title, description and price are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        priceLabel: form.priceLabel,
        listingType: form.listingType,
        propertyType: form.propertyType,
        sqft: form.sqft || 0,
        bedrooms: form.bedrooms || 0,
        bathrooms: form.bathrooms || 0,
        garage: form.garage || 0,
        location: {
          address: form.address,
          city: form.city,
          district: form.district,
          country: form.country,
          zipCode: form.zipCode,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        },
        features: form.features,
        isFeatured: form.isFeatured,
        status: form.status,
        images: form.images,
        keepImages: form.keepImages,
      };

      if (editProperty) {
        await axios.put(
          `${server}/property/admin/update-property/${editProperty._id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Property updated successfully!");
      } else {
        await axios.post(`${server}/property/admin/create-property`, payload, {
          withCredentials: true,
        });
        toast.success("Property created successfully!");
        setForm(EMPTY_FORM);
        setImagePreview([]);
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={labelCls}>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Luxury Beachfront Villa in West Bay"
            className={inputCls}
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelCls}>Description *</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Detailed description of the property..."
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        {/* Listing Type */}
        <div>
          <label className={labelCls}>Listing Type *</label>
          <select
            value={form.listingType}
            onChange={(e) => setForm((f) => ({ ...f, listingType: e.target.value }))}
            className={inputCls}
          >
            {LISTING_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>{lt.label}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className={labelCls}>Property Type *</label>
          <select
            value={form.propertyType}
            onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
            className={inputCls}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className={labelCls}>Price ($) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 450000"
            className={inputCls}
            required
          />
        </div>

        {/* Price Label */}
        <div>
          <label className={labelCls}>Price Label (optional)</label>
          <input
            type="text"
            value={form.priceLabel}
            onChange={(e) => setForm((f) => ({ ...f, priceLabel: e.target.value }))}
            placeholder="e.g. per month, per year"
            className={inputCls}
          />
        </div>

        {/* Sq Ft */}
        <div>
          <label className={labelCls}>Square Feet</label>
          <input
            type="number"
            value={form.sqft}
            onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value }))}
            placeholder="e.g. 2500"
            className={inputCls}
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className={labelCls}>Bedrooms</label>
          <input
            type="number"
            value={form.bedrooms}
            onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
            placeholder="e.g. 3"
            className={inputCls}
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label className={labelCls}>Bathrooms</label>
          <input
            type="number"
            value={form.bathrooms}
            onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
            placeholder="e.g. 2"
            className={inputCls}
          />
        </div>

        {/* Garage */}
        <div>
          <label className={labelCls}>Garage Spaces</label>
          <input
            type="number"
            value={form.garage}
            onChange={(e) => setForm((f) => ({ ...f, garage: e.target.value }))}
            placeholder="e.g. 1"
            className={inputCls}
          />
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiOutlineLocationMarker className="w-5 h-5 text-blue-500" />
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Street address"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. George Town"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>District</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              placeholder="e.g. West Bay"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Zip / Post Code</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Latitude (for map)</label>
            <input
              type="number"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              placeholder="e.g. 19.3133"
              className={inputCls}
              step="any"
            />
          </div>
          <div>
            <label className={labelCls}>Longitude (for map)</label>
            <input
              type="number"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              placeholder="e.g. -81.2546"
              className={inputCls}
              step="any"
            />
          </div>
        </div>
      </div>

      {/* Features / Amenities */}
      <div>
        <label className={labelCls}>Features & Amenities</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={form.newFeature}
            onChange={(e) => setForm((f) => ({ ...f, newFeature: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            placeholder="e.g. Swimming Pool, Garden, Sea View..."
            className={inputCls}
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Add
          </button>
        </div>
        {form.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.features.map((feat, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
                {feat}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className={labelCls}>Property Images</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
        >
          <HiOutlinePhotograph className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Click to upload images</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP supported</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        {imagePreview.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
            {imagePreview.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <img src={img.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full transition-all"
                  >
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-7">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
            className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors ${
              form.isFeatured ? "bg-yellow-400" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.isFeatured ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}>
            Mark as Featured ★
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70"
        >
          {loading ? "Saving..." : editProperty ? "Update Property" : "Create Property"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ─── Property Row ──────────────────────────────────────────────────────────────
const PropertyRow = ({ property, onEdit, onDelete, onStatusChange }) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const mainImage = property.images?.[0]?.url;
  const listingBadge = property.listingType === "rent"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700";

  const statusOpt = STATUS_OPTIONS.find((s) => s.value === property.status) || STATUS_OPTIONS[0];

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await axios.patch(
        `${server}/property/admin/update-status/${property._id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success("Status updated!");
      onStatusChange();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiOutlineHome className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${listingBadge}`}>
                  {property.listingType === "rent" ? "For Rent" : "For Sale"}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {property.propertyType}
                </span>
                {property.isFeatured && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    ★ Featured
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                {property.title}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {[property.location?.city, property.location?.district].filter(Boolean).join(", ") || "Location not set"}
              </p>
            </div>
            <p className="text-blue-700 font-bold text-lg whitespace-nowrap">
              ${Number(property.price).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
            {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
            {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
            {property.sqft > 0 && <span>{Number(property.sqft).toLocaleString()} sqft</span>}
            <span className="flex items-center gap-1">
              <HiOutlineEye className="w-3.5 h-3.5" />
              {property.views}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-gray-100">
            {/* Status select */}
            <select
              value={property.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusLoading}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${statusOpt.color}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <a
                href={`/real-estate/${property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="View"
              >
                <HiOutlineEye className="w-4 h-4" />
              </a>
              <button
                onClick={() => onEdit(property)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Edit"
              >
                <HiOutlinePencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(property._id, property.title)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("manage"); // manage | add
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editProperty, setEditProperty] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    listingType: "all",
    search: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ status: "all", listingType: "all", search: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProperties = useCallback(async (page = 1, f = appliedFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (f.status !== "all") params.append("status", f.status);
      if (f.listingType !== "all") params.append("listingType", f.listingType);
      if (f.search) params.append("search", f.search);

      const { data } = await axios.get(
        `${server}/property/admin/get-all-properties?${params.toString()}`,
        { withCredentials: true }
      );
      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (activeTab === "manage") {
      fetchProperties(1, appliedFilters);
    }
  }, [activeTab, appliedFilters]);

  const handleDelete = async (id, title) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${server}/property/admin/delete-property/${id}`, {
        withCredentials: true,
      });
      toast.success(`"${title}" deleted`);
      setDeleteConfirm(null);
      fetchProperties(currentPage, appliedFilters);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditProperty(null);
    setActiveTab("manage");
    fetchProperties(currentPage, appliedFilters);
  };

  const handleCreateSuccess = () => {
    setActiveTab("manage");
    fetchProperties(1, appliedFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineHome className="w-7 h-7 text-blue-600" />
            Real Estate Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage properties, listings, and inquiries
          </p>
        </div>
        <button
          onClick={() => { setEditProperty(null); setActiveTab(activeTab === "add" ? "manage" : "add"); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            activeTab === "add"
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          <HiOutlinePlus className="w-4 h-4" />
          {activeTab === "add" ? "View Properties" : "Add Property"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: "manage", label: `All Properties (${total})` },
          { key: "add", label: editProperty ? "Edit Property" : "Add Property" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === "manage") setEditProperty(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MANAGE TAB */}
      {activeTab === "manage" && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search title or city..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && setAppliedFilters({ ...filters })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select
                value={filters.listingType}
                onChange={(e) => setFilters((f) => ({ ...f, listingType: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <button
                onClick={() => setAppliedFilters({ ...filters })}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <HiOutlineHome className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-400 text-sm mb-4">Start by adding your first property</p>
              <button
                onClick={() => setActiveTab("add")}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700"
              >
                Add Property
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((p) => (
                <PropertyRow
                  key={p._id}
                  property={p}
                  onEdit={(prop) => { setEditProperty(prop); setActiveTab("add"); }}
                  onDelete={(id, title) => setDeleteConfirm({ id, title })}
                  onStatusChange={() => fetchProperties(currentPage, appliedFilters)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProperties(page, appliedFilters)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT TAB */}
      {activeTab === "add" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editProperty ? `Edit: ${editProperty.title}` : "Add New Property"}
          </h2>
          <PropertyForm
            editProperty={editProperty}
            onSuccess={editProperty ? handleEditSuccess : handleCreateSuccess}
            onCancel={editProperty ? () => { setEditProperty(null); setActiveTab("manage"); } : null}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Property</h3>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.title)}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyManagement;
