import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import useBlog, { STATIC_BLOGS } from "../hooks/useBlog";
import {
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineTag,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlineNewspaper,
} from "react-icons/hi";

// Category config
const CATEGORY_COLORS = {
  news: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  announcement: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  deals: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  guide: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  tips: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  lifestyle: { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
  technology: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-500" },
  other: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const CategoryBadge = ({ category }) => {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

// Featured blog card (large)
const FeaturedCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-slate-100"
  >
    <div className="relative lg:w-3/5 h-64 lg:h-auto overflow-hidden">
      <img
        src={post.coverImage || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:bg-gradient-to-l"></div>
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          Featured
        </span>
      </div>
    </div>
    <div className="flex flex-col justify-center lg:w-2/5 p-8 lg:p-10">
      <div className="mb-4">
        <CategoryBadge category={post.category} />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors duration-300 line-clamp-3">
        {post.title}
      </h2>
      <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {(post.author?.name || "A").charAt(0)}
          </div>
          {post.author?.name || "Admin"}
        </span>
        <span className="flex items-center gap-1">
          <HiOutlineCalendar className="w-4 h-4" />
          {formatDate(post.publishedAt)}
        </span>
        <span className="flex items-center gap-1">
          <HiOutlineClock className="w-4 h-4" />
          {post.readTime || 1} min read
        </span>
        {post.views > 0 && (
          <span className="flex items-center gap-1">
            <HiOutlineEye className="w-4 h-4" />
            {post.views.toLocaleString()}
          </span>
        )}
      </div>
      <div className="mt-6">
        <span className="inline-flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all duration-300">
          Read article
          <HiOutlineChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  </Link>
);

// Regular blog card
const BlogCard = ({ post, index }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-2 border border-slate-100"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="relative h-52 overflow-hidden">
      <img
        src={post.coverImage || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-3 left-3">
        <CategoryBadge category={post.category} />
      </div>
    </div>
    <div className="flex flex-col flex-1 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
        {post.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 flex-1">
        {post.excerpt}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
            >
              <HiOutlineTag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {(post.author?.name || "A").charAt(0)}
          </div>
          {post.author?.name || "Admin"}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <HiOutlineClock className="w-3.5 h-3.5" />
            {post.readTime || 1}m
          </span>
          {post.views > 0 && (
            <span className="flex items-center gap-1">
              <HiOutlineEye className="w-3.5 h-3.5" />
              {post.views.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const BLOGS_PER_PAGE = 6;

  const { blogs, loading, total, totalPages, fetchBlogs, fetchCategories } = useBlog();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  // Fetch blogs
  useEffect(() => {
    fetchBlogs({
      category: selectedCategory,
      search: debouncedSearch,
      page: currentPage,
      limit: BLOGS_PER_PAGE,
    });
  }, [fetchBlogs, selectedCategory, debouncedSearch, currentPage]);

  // Fetch categories once
  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats || []));
  }, [fetchCategories]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const displayBlogs = blogs.length > 0 ? blogs : STATIC_BLOGS;
  // Prefer admin-marked featured blog; fall back to first post
  const featuredPost = currentPage === 1 && !debouncedSearch && selectedCategory === "all"
    ? (displayBlogs.find(b => b.isFeatured) || displayBlogs[0])
    : null;
  const restPosts = featuredPost ? displayBlogs.filter(b => b !== featuredPost) : displayBlogs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header activeHeading={6} />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 pt-16 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:24px_24px]"></div>
        {/* Orbs */}
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/6 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
            <HiOutlineNewspaper className="w-4 h-4 text-indigo-200" />
            <span className="text-sm text-indigo-100 font-medium">Mall of Cayman Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Stories, Tips &{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10">
            Stay ahead with the latest news, shopping guides, exclusive deals, and
            stories from the Mall of Cayman community.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-slate-800 placeholder-slate-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => {
              const key = cat._id || cat.name;
              const c = CATEGORY_COLORS[key] || CATEGORY_COLORS.other;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === key
                      ? `${c.bg} ${c.text} shadow-sm`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span className="text-xs opacity-70">
                    ({cat.count || 0})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4 shadow"></div>
            <p className="text-slate-600 font-medium">Loading articles...</p>
          </div>
        ) : displayBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <HiOutlineBookOpen className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No articles found</h3>
            <p className="text-slate-500 mb-6">
              {debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different keyword.`
                : "No articles in this category yet."}
            </p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              View All Posts
            </button>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featuredPost && (
              <div className="mb-12">
                <FeaturedCard post={featuredPost} />
              </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{total || displayBlogs.length}</span>{" "}
                article{(total || displayBlogs.length) !== 1 ? "s" : ""} found
                {selectedCategory !== "all" && (
                  <> in <span className="font-semibold text-indigo-600">{selectedCategory}</span></>
                )}
              </p>
              {(debouncedSearch || selectedCategory !== "all") && (
                <button
                  onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {restPosts.map((post, i) => (
                <BlogCard key={post._id} post={post} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        p === currentPage
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Newsletter CTA ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-700 py-16 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Stay in the loop
          </h2>
          <p className="text-indigo-200 mb-8">
            Subscribe to our newsletter and never miss a new article, deal, or
            announcement.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <HiOutlineNewspaper className="w-5 h-5" />
            Contact Us
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;
