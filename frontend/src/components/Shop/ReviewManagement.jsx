import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  HiStar,
  HiOutlineStar,
  HiOutlineReply,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFilter } from "react-icons/bs";

const ReviewManagement = () => {
  const { seller } = useSelector((state) => state.seller);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    ratingDistribution: {},
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReply, setEditingReply] = useState(null);

  useEffect(() => {
    if (seller?._id) {
      fetchReviews();
      fetchStats();
    }
  }, [seller, filterStatus, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterRating) {
        params.append("rating", filterRating);
      }

      const { data } = await axios.get(
        `${server}/review/seller-reviews?${params}`,
        { withCredentials: true }
      );

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${server}/review/seller-review-stats`, {
        withCredentials: true,
      });

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${server}/review/reply/${reviewId}`,
        { replyText },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Reply posted successfully!");
        setReplyingTo(null);
        setEditingReply(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = (review) => {
    setEditingReply(review._id);
    setReplyText(review.vendorReply.text);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <HiStar
              key={star}
              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
            />
          ) : (
            <HiOutlineStar
              key={star}
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300"
            />
          )
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (review) => {
    if (!review.isApprovedByAdmin) {
      return (
        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] sm:text-xs font-medium flex items-center whitespace-nowrap">
          <HiOutlineClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Pending
        </span>
      );
    }
    return (
      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-medium flex items-center whitespace-nowrap">
        <HiOutlineCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        Approved
      </span>
    );
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-4 sm:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Review Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Monitor and respond to customer reviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">
                Total Reviews
              </h3>
              <HiStar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">
              {stats.totalReviews}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">
                Avg Rating
              </h3>
              <HiStar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <p className="text-xl sm:text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
              <span className="text-xs sm:text-sm text-gray-500">/ 5</span>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">
                Pending
              </h3>
              <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">
              {stats.pendingReviews}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">
                Approved
              </h3>
              <HiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">
              {stats.approvedReviews}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
                <BsFilter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterStatus === "all"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("approved")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterStatus === "approved"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterStatus === "pending"
                      ? "bg-yellow-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                Filter by Rating
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterRating === null
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                      filterRating === rating
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{rating}</span>
                    <HiStar className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-20">
            <AiOutlineLoading3Quarters className="animate-spin text-3xl sm:text-4xl text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 text-center">
            <HiOutlineStar className="w-12 h-12 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
              No Reviews Found
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {filterStatus === "pending"
                ? "No pending reviews at the moment"
                : "You haven't received any reviews yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col gap-3 sm:gap-6">
                  {/* Product Info */}
                  <div className="lg:w-1/3">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {review.product?.images?.[0]?.url && (
                        <img
                          src={review.product.images[0].url}
                          alt={review.product.name}
                          className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-2">
                          {review.product?.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {review.product?.category}
                        </p>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[10px] sm:text-xs font-medium mt-1 sm:mt-2">
                            <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="lg:w-2/3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base text-gray-900">
                            {review.user?.name || "Anonymous"}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                            <HiOutlineCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:space-y-2 ml-10 sm:ml-0">
                        {renderStars(review.rating)}
                        {getStatusBadge(review)}
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Vendor Reply */}
                    {review.vendorReply && editingReply !== review._id ? (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-lg">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <HiOutlineReply className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                              <span className="font-medium text-sm sm:text-base text-blue-900">
                                Your Reply
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-[10px] sm:text-xs text-blue-600">
                                  {formatDate(review.vendorReply.createdAt)}
                                </span>
                                <button
                                  onClick={() => handleEditReply(review)}
                                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-700">
                              {review.vendorReply.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {replyingTo === review._id ||
                        editingReply === review._id ? (
                          <div className="mt-3 sm:mt-4">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              rows="3"
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-3">
                              <button
                                onClick={() => handleReply(review._id)}
                                disabled={submitting}
                                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                              >
                                {submitting ? (
                                  <AiOutlineLoading3Quarters className="animate-spin" />
                                ) : editingReply === review._id ? (
                                  "Update"
                                ) : (
                                  "Post"
                                )}
                              </button>
                              <button
                                onClick={handleCancelReply}
                                disabled={submitting}
                                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-200 text-gray-700 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors duration-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          !review.vendorReply && (
                            <button
                              onClick={() => setReplyingTo(review._id)}
                              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:bg-blue-200 transition-colors duration-300"
                            >
                              <HiOutlineReply className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Reply</span>
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
