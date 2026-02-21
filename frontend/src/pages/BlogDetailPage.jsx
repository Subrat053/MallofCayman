import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import useBlog, { STATIC_BLOGS } from "../hooks/useBlog";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineTag,
  HiOutlineArrowLeft,
  HiOutlineShare,
  HiOutlineBookOpen,
  HiOutlineChevronRight,
} from "react-icons/hi";

const CATEGORY_COLORS = {
  news: { bg: "bg-blue-100", text: "text-blue-700" },
  announcement: { bg: "bg-purple-100", text: "text-purple-700" },
  deals: { bg: "bg-green-100", text: "text-green-700" },
  guide: { bg: "bg-orange-100", text: "text-orange-700" },
  tips: { bg: "bg-yellow-100", text: "text-yellow-700" },
  lifestyle: { bg: "bg-pink-100", text: "text-pink-700" },
  technology: { bg: "bg-cyan-100", text: "text-cyan-700" },
  other: { bg: "bg-gray-100", text: "text-gray-700" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Renders static plain-text content or simple HTML safely
const BlogContent = ({ content }) => {
  if (!content) return null;
  // If content looks like HTML, render it; otherwise render as paragraphs
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  if (isHTML) {
    return (
      <div
        className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-indigo-600 prose-strong:text-slate-900 prose-img:rounded-2xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div className="space-y-5">
      {content.split("\n\n").map((para, i) => (
        <p key={i} className="text-slate-700 leading-relaxed text-base lg:text-lg">
          {para}
        </p>
      ))}
    </div>
  );
};

// Static full content for demo
const STATIC_FULL_CONTENT = {
  "welcome-to-mall-of-cayman": `
    <h2>A New Era of Shopping</h2>
    <p>Welcome to Mall of Cayman — the premier destination for online shopping in the Cayman Islands and beyond. Whether you're looking for the latest fashion, cutting-edge electronics, stunning home décor, or unique artisan products, you'll find it all right here.</p>
    <h2>What Makes Us Different?</h2>
    <p>We're not just another marketplace. Mall of Cayman was built with three core promises: <strong>quality, trust, and community</strong>. Every seller on our platform goes through a rigorous vetting process to ensure you receive only the best products.</p>
    <ul>
      <li>✅ Verified sellers with transparent ratings</li>
      <li>✅ Secure payment processing</li>
      <li>✅ Real-time order tracking</li>
      <li>✅ Dedicated customer support</li>
    </ul>
    <h2>Get Started Today</h2>
    <p>Create your free account, browse thousands of products, and experience the future of shopping. And if you're a business owner — <a href="/shop-create">become a seller</a> and reach customers like never before.</p>
  `,
  "top-10-holiday-deals": `
    <h2>It's the Most Wonderful (Shopping) Time of the Year</h2>
    <p>The holiday season is the perfect time to celebrate with the best deals across every category. We've curated the top 10 deals you absolutely cannot afford to miss.</p>
    <h2>Electronics</h2>
    <p>Up to <strong>40% off</strong> on top-brand smartphones, laptops, and accessories. Whether you're gifting or treating yourself, now is the best time to buy.</p>
    <h2>Fashion</h2>
    <p>Our fashion category is bursting with designer pieces at unbeatable prices. From casual wear to formal attire — dress to impress without breaking the bank.</p>
    <h2>Home & Décor</h2>
    <p>Transform your living space with beautiful home décor items. Limited-time bundles available for the holiday season only.</p>
    <p>These deals expire at midnight on December 31st. Don't wait — your cart is waiting!</p>
  `,
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { blog, loading, error, fetchBlog, fetchBlogs, blogs: relatedBlogs } = useBlog();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) fetchBlog(slug);
  }, [slug, fetchBlog]);

  // Fetch related posts
  useEffect(() => {
    if (blog?.category) {
      fetchBlogs({ category: blog.category, limit: 3 });
    } else {
      fetchBlogs({ limit: 3 });
    }
  }, [blog?.category, fetchBlogs]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine which blog to display: live or static fallback
  const displayBlog =
    blog ||
    STATIC_BLOGS.find((b) => b.slug === slug) ||
    STATIC_BLOGS[0];

  const displayContent =
    (displayBlog && displayBlog.content) ||
    STATIC_FULL_CONTENT[displayBlog?.slug] ||
    "<p>Full article content will appear here once the blog is published from the admin panel.</p>";

  const categoryStyle =
    CATEGORY_COLORS[displayBlog?.category] || CATEGORY_COLORS.other;

  // Related posts: exclude current
  const related = (relatedBlogs.length > 0 ? relatedBlogs : STATIC_BLOGS)
    .filter((b) => b.slug !== slug)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activeHeading={6} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4 shadow"></div>
            <p className="text-slate-600 font-medium">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !displayBlog) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header activeHeading={6} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <HiOutlineBookOpen className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
          <p className="text-slate-500 mb-6">This article doesn't exist or has been removed.</p>
          <Link
            to="/blog"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      <Header activeHeading={6} />

      {/* ── Hero Image ── */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] overflow-hidden bg-slate-900 mt-0">
        <img
          src={
            displayBlog?.coverImage ||
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80"
          }
          alt={displayBlog?.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        {/* Back button */}
        <div className="absolute top-6 left-4 sm:left-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-200"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${categoryStyle.bg} ${categoryStyle.text}`}
            >
              {displayBlog?.category}
            </span>
            <span className="text-slate-300 text-sm flex items-center gap-1.5">
              <HiOutlineCalendar className="w-4 h-4" />
              {formatDate(displayBlog?.publishedAt)}
            </span>
            <span className="text-slate-300 text-sm flex items-center gap-1.5">
              <HiOutlineClock className="w-4 h-4" />
              {displayBlog?.readTime || 1} min read
            </span>
            {displayBlog?.views > 0 && (
              <span className="text-slate-300 text-sm flex items-center gap-1.5">
                <HiOutlineEye className="w-4 h-4" />
                {displayBlog.views.toLocaleString()} views
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight max-w-4xl">
            {displayBlog?.title}
          </h1>
        </div>
      </div>

      {/* ── Article Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Main Article ── */}
          <article className="lg:col-span-2">
            {/* Author + Share */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow">
                  {(displayBlog?.author?.name || "A").charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {displayBlog?.author?.name || "Mall of Cayman Team"}
                  </p>
                  <p className="text-xs text-slate-500">Author</p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  copied
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                <HiOutlineShare className="w-4 h-4" />
                {copied ? "Link Copied!" : "Share Article"}
              </button>
            </div>

            {/* Excerpt */}
            {displayBlog?.excerpt && (
              <p className="text-lg text-slate-600 leading-relaxed mb-8 p-6 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-2xl font-medium italic">
                {displayBlog.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 lg:p-10 mb-8">
              <BlogContent content={displayContent} />
            </div>

            {/* Tags */}
            {displayBlog?.tags && displayBlog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  <HiOutlineTag className="w-4 h-4" />
                  Tags:
                </span>
                {displayBlog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Back to blog */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group"
            >
              <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to all articles
            </Link>
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-8">
            {/* Article info card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Article Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <HiOutlineCalendar className="w-4 h-4" />
                    Published
                  </span>
                  <span className="font-medium text-slate-700 text-right">
                    {formatDate(displayBlog?.publishedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4" />
                    Read time
                  </span>
                  <span className="font-medium text-slate-700">
                    {displayBlog?.readTime || 1} min
                  </span>
                </div>
                {displayBlog?.views > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <HiOutlineEye className="w-4 h-4" />
                      Views
                    </span>
                    <span className="font-medium text-slate-700">
                      {displayBlog.views.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text}`}
                  >
                    {displayBlog?.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 text-base mb-5 flex items-center gap-2">
                  <HiOutlineBookOpen className="w-5 h-5 text-indigo-500" />
                  Related Articles
                </h3>
                <div className="space-y-5">
                  {related.map((r) => (
                    <Link
                      key={r._id}
                      to={`/blog/${r.slug}`}
                      className="flex gap-3 group"
                    >
                      <img
                        src={
                          r.coverImage ||
                          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=60"
                        }
                        alt={r.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />
                          {r.readTime || 1} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/blog"
                  className="flex items-center gap-1.5 mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View all articles
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-xl">
              <h3 className="font-bold text-lg mb-2">Start Shopping Today</h3>
              <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                Discover thousands of products from trusted sellers.
              </p>
              <Link
                to="/products"
                className="inline-block w-full py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow"
              >
                Browse Products
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
