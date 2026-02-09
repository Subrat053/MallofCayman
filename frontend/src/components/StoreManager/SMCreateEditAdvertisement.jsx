import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  AiOutlineArrowLeft,
  AiOutlineUpload,
  AiOutlineDelete,
} from "react-icons/ai";
import { MdOutlineAdsClick } from "react-icons/md";

const SMCreateEditAdvertisement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [adTypes, setAdTypes] = useState([]);

  const [formData, setFormData] = useState({
    adType: "store_banner",
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    priority: 0,
    displayOnStorePage: true,
    displayOnProductPages: false,
    targetAudience: "all",
    productId: "",
    notes: "",
    status: "draft",
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [existingMedia, setExistingMedia] = useState(null);

  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchAdvertisement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInitialData = async () => {
    try {
      // Fetch ad types
      const typesRes = await axios.get(
        `${server}/store-manager-advertisement/ad-types`,
        { withCredentials: true },
      );
      if (typesRes.data.success) {
        setAdTypes(typesRes.data.adTypes);
      }

      // Fetch products
      const productsRes = await axios.get(
        `${server}/store-manager-advertisement/shop-products`,
        { withCredentials: true },
      );
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/store-manager-advertisement/ad/${id}`,
        { withCredentials: true },
      );

      if (data.success) {
        const ad = data.advertisement;
        setFormData({
          adType: ad.adType,
          title: ad.title,
          description: ad.description || "",
          startDate: new Date(ad.startDate).toISOString().split("T")[0],
          endDate: new Date(ad.endDate).toISOString().split("T")[0],
          priority: ad.priority || 0,
          displayOnStorePage: ad.displayOnStorePage,
          displayOnProductPages: ad.displayOnProductPages,
          targetAudience: ad.targetAudience || "all",
          productId: ad.productId?._id || "",
          notes: ad.notes || "",
          status: ad.status,
        });

        if (ad.image?.url) {
          setExistingMedia({ type: "image", url: ad.image.url });
        } else if (ad.video?.url) {
          setExistingMedia({ type: "video", url: ad.video.url });
        }
      }
    } catch (error) {
      toast.error("Failed to load advertisement");
      navigate("/store-manager/advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB for videos, 10MB for images)
      const maxSize = file.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          `File too large. Max size: ${file.type.startsWith("video/") ? "50MB" : "10MB"}`,
        );
        return;
      }

      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({
          type: file.type.startsWith("video/") ? "video" : "image",
          url: reader.result,
        });
      };
      reader.readAsDataURL(file);
      setExistingMedia(null);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!isEditMode && !mediaFile && !existingMedia) {
      toast.error("Please upload an image or video");
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append("adType", formData.adType);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("startDate", formData.startDate);
      submitData.append("endDate", formData.endDate);
      submitData.append("priority", formData.priority);
      submitData.append("displayOnStorePage", formData.displayOnStorePage);
      submitData.append(
        "displayOnProductPages",
        formData.displayOnProductPages,
      );
      submitData.append("targetAudience", formData.targetAudience);
      submitData.append("notes", formData.notes);
      submitData.append("status", formData.status);

      if (formData.productId) {
        submitData.append("productId", formData.productId);
      }

      if (mediaFile) {
        submitData.append("media", mediaFile);
      }

      let response;
      if (isEditMode) {
        response = await axios.put(
          `${server}/store-manager-advertisement/ad/${id}`,
          submitData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        response = await axios.post(
          `${server}/store-manager-advertisement/create`,
          submitData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/store-manager/advertisements");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save advertisement",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-2 sm:mx-4 800px:mx-8 pt-1 mt-4 sm:mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-3 sm:p-6 border-b bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/store-manager/advertisements")}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <AiOutlineArrowLeft className="text-white" size={20} />
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <MdOutlineAdsClick className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                {isEditMode ? "Edit Advertisement" : "Create Advertisement"}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                {isEditMode
                  ? "Update your advertisement details"
                  : "Create a new advertisement for your store"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Ad Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Type <span className="text-red-500">*</span>
              </label>
              <select
                name="adType"
                value={formData.adType}
                onChange={handleChange}
                disabled={isEditMode}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
              >
                {adTypes.map((type) => (
                  <option key={type.adType} value={type.adType}>
                    {type.name} ({type.size})
                  </option>
                ))}
              </select>
              {adTypes.find((t) => t.adType === formData.adType)
                ?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {
                    adTypes.find((t) => t.adType === formData.adType)
                      ?.description
                  }
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter advertisement title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                placeholder="Enter advertisement description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500
              </p>
            </div>

            {/* Link to Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Product (Optional)
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Link to Shop Page</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to link to your shop page
              </p>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image/Video <span className="text-red-500">*</span>
              </label>

              {mediaPreview || existingMedia ? (
                <div className="relative">
                  {mediaPreview?.type === "video" ||
                  existingMedia?.type === "video" ? (
                    <video
                      src={mediaPreview?.url || existingMedia?.url}
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview?.url || existingMedia?.url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <AiOutlineUpload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, MP4, WEBM (MAX. 10MB for images, 50MB for
                      videos)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (0-10)
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min={0}
                max={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher priority ads are displayed first
              </p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="new_customers">New Customers</option>
                <option value="returning_customers">Returning Customers</option>
              </select>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Display Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="displayOnStorePage"
                    checked={formData.displayOnStorePage}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Display on store page
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="displayOnProductPages"
                    checked={formData.displayOnProductPages}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Display on product pages
                  </span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="active">Active (Publish now)</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Notes for internal reference (not displayed)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/store-manager/advertisements")}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : isEditMode ? (
              "Update Advertisement"
            ) : (
              "Create Advertisement"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SMCreateEditAdvertisement;
