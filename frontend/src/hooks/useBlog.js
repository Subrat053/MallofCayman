import { useState, useCallback } from "react";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";

// ─── Static fallback data shown when backend has no blogs yet ─────────────────
export const STATIC_BLOGS = [
  {
    _id: "static-1",
    title: "Welcome to Mall of Cayman – Your Ultimate Shopping Destination",
    slug: "welcome-to-mall-of-cayman",
    excerpt:
      "Discover a curated collection of top brands and local artisans all under one digital roof. Here's everything you need to know about getting started on our platform.",
    coverImage:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    category: "announcement",
    tags: ["welcome", "launch", "shopping"],
    author: { name: "Mall of Cayman Team" },
    publishedAt: new Date("2025-12-01").toISOString(),
    readTime: 3,
    views: 1240,
    status: "published",
  },
  {
    _id: "static-2",
    title: "Top 10 Holiday Deals You Can't Miss This Season",
    slug: "top-10-holiday-deals",
    excerpt:
      "The festive season is here! We've rounded up the best deals across electronics, fashion, home décor, and more. Don't miss out on these limited-time offers.",
    coverImage:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80",
    category: "deals",
    tags: ["holiday", "deals", "sale"],
    author: { name: "Editorial Team" },
    publishedAt: new Date("2025-12-15").toISOString(),
    readTime: 5,
    views: 3560,
    status: "published",
  },
  {
    _id: "static-3",
    title: "How to Shop Safely Online: A Complete Buyer's Guide",
    slug: "how-to-shop-safely-online",
    excerpt:
      "Online shopping is convenient, but it comes with risks. Follow these expert-backed tips to ensure your purchases are safe, secure, and satisfying every time.",
    coverImage:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    category: "guide",
    tags: ["tips", "security", "buyers"],
    author: { name: "Security Team" },
    publishedAt: new Date("2026-01-10").toISOString(),
    readTime: 7,
    views: 2100,
    status: "published",
  },
  {
    _id: "static-4",
    title: "Meet Our Sellers: Stories Behind the Brands",
    slug: "meet-our-sellers",
    excerpt:
      "Behind every great product is a passionate seller. We spotlight some of the incredible entrepreneurs who have made Mall of Cayman their home.",
    coverImage:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    category: "lifestyle",
    tags: ["sellers", "community", "spotlight"],
    author: { name: "Community Team" },
    publishedAt: new Date("2026-01-25").toISOString(),
    readTime: 4,
    views: 980,
    status: "published",
  },
  {
    _id: "static-5",
    title: "New Feature: Real-Time Order Tracking is Now Live",
    slug: "real-time-order-tracking",
    excerpt:
      "We've launched an all-new real-time order tracking system so you always know exactly where your package is. Here's how to use it.",
    coverImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    category: "news",
    tags: ["feature", "tracking", "update"],
    author: { name: "Product Team" },
    publishedAt: new Date("2026-02-05").toISOString(),
    readTime: 3,
    views: 4200,
    status: "published",
  },
  {
    _id: "static-6",
    title: "Sustainable Shopping: How We're Going Green",
    slug: "sustainable-shopping",
    excerpt:
      "Mall of Cayman is committed to a greener future. Learn about our eco-friendly packaging initiative, carbon-neutral delivery options, and our environmental goals.",
    coverImage:
      "https://images.unsplash.com/photo-1542601906897-a90e9e7e5e18?w=800&q=80",
    category: "lifestyle",
    tags: ["sustainability", "eco", "green"],
    author: { name: "CSR Team" },
    publishedAt: new Date("2026-02-14").toISOString(),
    readTime: 6,
    views: 1750,
    status: "published",
  },
];

const useBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Public ──────────────────────────────────────────────────────────────────

  const fetchBlogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (params.category && params.category !== "all")
        query.append("category", params.category);
      if (params.search) query.append("search", params.search);
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);

      const response = await axios.get(
        `${server}/blog/get-blogs?${query.toString()}`
      );

      if (response.data.success) {
        setBlogs(response.data.blogs);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        return response.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch blogs";
      setError(msg);
      // Fall back to static data
      setBlogs(STATIC_BLOGS);
      setTotal(STATIC_BLOGS.length);
      setTotalPages(1);
      return { blogs: STATIC_BLOGS, total: STATIC_BLOGS.length };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlog = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${server}/blog/get-blog/${slug}`);
      if (response.data.success) {
        setBlog(response.data.blog);
        return response.data.blog;
      }
    } catch (err) {
      // Fallback to static blog if backend unavailable
      const staticBlog = STATIC_BLOGS.find((b) => b.slug === slug);
      if (staticBlog) {
        setBlog(staticBlog);
        return staticBlog;
      }
      const msg = err.response?.data?.message || "Blog not found";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${server}/blog/get-categories`);
      if (response.data.success) return response.data.categories;
    } catch {
      // derive categories from static data
      const counts = STATIC_BLOGS.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
    }
    return [];
  }, []);

  // ─── Admin ───────────────────────────────────────────────────────────────────

  const adminFetchBlogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${server}/blog/admin/get-all-blogs?${query}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setBlogs(response.data.blogs);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        return response.data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  const adminGetBlog = useCallback(async (id) => {
    try {
      const response = await axios.get(
        `${server}/blog/admin/get-blog/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) return response.data.blog;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch blog");
    }
  }, []);

  const createBlog = useCallback(async (data) => {
    try {
      let payload;
      let headers = {};
      if (data.coverImageFile) {
        // Build multipart FormData
        payload = new FormData();
        payload.append("coverImage", data.coverImageFile);
        payload.append("title", data.title || "");
        payload.append("excerpt", data.excerpt || "");
        payload.append("content", data.content || "");
        payload.append("coverImageUrl", "");
        payload.append("category", data.category || "news");
        payload.append("tags", JSON.stringify(data.tags || []));
        payload.append("status", data.status || "draft");
        payload.append("isFeatured", data.isFeatured ? "true" : "false");
      } else {
        payload = {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImage || "",
          category: data.category,
          tags: data.tags,
          status: data.status,
          isFeatured: data.isFeatured || false,
        };
        headers = { "Content-Type": "application/json" };
      }
      const response = await axios.post(
        `${server}/blog/admin/create-blog`,
        payload,
        { withCredentials: true, headers }
      );
      if (response.data.success) {
        toast.success("Blog created successfully!");
        return response.data.blog;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create blog");
      throw err;
    }
  }, []);

  const updateBlog = useCallback(async (id, data) => {
    try {
      let payload;
      let headers = {};
      if (data.coverImageFile) {
        payload = new FormData();
        payload.append("coverImage", data.coverImageFile);
        payload.append("title", data.title || "");
        payload.append("excerpt", data.excerpt || "");
        payload.append("content", data.content || "");
        payload.append("coverImageUrl", "");
        payload.append("category", data.category || "news");
        payload.append("tags", JSON.stringify(data.tags || []));
        payload.append("status", data.status || "draft");
        payload.append("isFeatured", data.isFeatured ? "true" : "false");
      } else {
        payload = {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImageUrl: data.coverImage || "",
          category: data.category,
          tags: data.tags,
          status: data.status,
          isFeatured: data.isFeatured || false,
        };
        headers = { "Content-Type": "application/json" };
      }
      const response = await axios.put(
        `${server}/blog/admin/update-blog/${id}`,
        payload,
        { withCredentials: true, headers }
      );
      if (response.data.success) {
        toast.success("Blog updated successfully!");
        return response.data.blog;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update blog");
      throw err;
    }
  }, []);

  const deleteBlog = useCallback(async (id) => {
    try {
      const response = await axios.delete(
        `${server}/blog/admin/delete-blog/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Blog deleted successfully!");
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blog");
      throw err;
    }
  }, []);

  const toggleBlogStatus = useCallback(async (id) => {
    try {
      const response = await axios.put(
        `${server}/blog/admin/toggle-status/${id}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        return response.data.blog;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
      throw err;
    }
  }, []);

  const setFeaturedBlog = useCallback(async (id) => {
    try {
      const response = await axios.put(
        `${server}/blog/admin/toggle-featured/${id}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        return response.data.blog;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update featured status");
      throw err;
    }
  }, []);

  return {
    blogs,
    blog,
    loading,
    error,
    total,
    totalPages,
    fetchBlogs,
    fetchBlog,
    fetchCategories,
    adminFetchBlogs,
    adminGetBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    setFeaturedBlog,
  };
};

export default useBlog;
