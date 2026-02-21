const express = require("express");
const cloudinary = require("cloudinary").v2;
const {
  isAuthenticated,
  requirePermission,
} = require("../middleware/auth");
const Blog = require("../model/blog");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const router = express.Router();

// ─── Helper: upload buffer to Cloudinary ─────────────────────────────────────
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "blog/covers",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg"],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// Get all published blogs (public)
router.get(
  "/get-blogs",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { category, search, page = 1, limit = 9 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let query = { status: "published", isActive: true };

      if (category && category !== "all") {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const [blogs, total] = await Promise.all([
        Blog.find(query)
          .populate("author", "name avatar")
          .sort({ isFeatured: -1, publishedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select("-content"),
        Blog.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        blogs,
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get single blog by slug (public)
router.get(
  "/get-blog/:slug",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findOne({
        slug: req.params.slug,
        status: "published",
        isActive: true,
      }).populate("author", "name avatar");

      if (!blog) {
        return next(new ErrorHandler("Blog post not found", 404));
      }

      // Increment views
      blog.views += 1;
      await blog.save({ validateBeforeSave: false });

      res.status(200).json({ success: true, blog });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get blog categories with counts (public)
router.get(
  "/get-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await Blog.aggregate([
        { $match: { status: "published", isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      res.status(200).json({ success: true, categories });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// Admin: Get all blogs (all statuses)
router.get(
  "/admin/get-all-blogs",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, status, category } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let query = {};
      if (status && status !== "all") query.status = status;
      if (category && category !== "all") query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } },
        ];
      }

      const [blogs, total] = await Promise.all([
        Blog.find(query)
          .populate("author", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select("-content"),
        Blog.countDocuments(query),
      ]);

      const stats = await Blog.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
            },
            draft: {
              $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
            },
            totalViews: { $sum: "$views" },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        blogs,
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        stats: stats[0] || { total: 0, published: 0, draft: 0, totalViews: 0 },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get single blog by ID
router.get(
  "/admin/get-blog/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id).populate(
        "author",
        "name email"
      );
      if (!blog) return next(new ErrorHandler("Blog not found", 404));
      res.status(200).json({ success: true, blog });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Create blog
router.post(
  "/admin/create-blog",
  isAuthenticated,
  requirePermission("canManageContent"),
  upload.single("coverImage"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        title, excerpt, content, coverImageUrl,
        category, tags, status, isFeatured,
      } = req.body;

      if (!title || !content) {
        return next(new ErrorHandler("Title and content are required", 400));
      }

      // Resolve cover image: uploaded file takes priority over URL
      let coverImage = coverImageUrl || "";
      let coverImagePublicId = "";
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, {
          transformation: [{ width: 1200, height: 675, crop: "fill", quality: "auto" }],
        });
        coverImage = result.secure_url;
        coverImagePublicId = result.public_id;
      }

      // Parse tags (comes as JSON string when using FormData)
      let tagsArray = [];
      if (tags) {
        try { tagsArray = typeof tags === "string" ? JSON.parse(tags) : tags; }
        catch { tagsArray = []; }
      }

      const isFeatureBool = isFeatured === "true" || isFeatured === true;

      // If marking as featured, unset all existing featured blogs first
      if (isFeatureBool) {
        await Blog.updateMany({}, { isFeatured: false });
      }

      const blog = await Blog.create({
        title, excerpt, content,
        coverImage, coverImagePublicId,
        category: category || "news",
        tags: tagsArray,
        status: status || "draft",
        isFeatured: isFeatureBool,
        author: req.user._id,
        publishedAt: status === "published" ? new Date() : undefined,
      });

      res.status(201).json({ success: true, blog });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Update blog
router.put(
  "/admin/update-blog/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  upload.single("coverImage"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return next(new ErrorHandler("Blog not found", 404));

      const {
        title, excerpt, content, coverImageUrl,
        category, tags, status, isFeatured,
      } = req.body;

      if (title) blog.title = title;
      if (excerpt !== undefined) blog.excerpt = excerpt;
      if (content) blog.content = content;
      if (category) blog.category = category;

      // Tags
      if (tags !== undefined) {
        try { blog.tags = typeof tags === "string" ? JSON.parse(tags) : tags; }
        catch { blog.tags = []; }
      }

      // Cover image: uploaded file > new URL > keep existing
      if (req.file) {
        // Delete old Cloudinary image if it exists
        if (blog.coverImagePublicId) {
          try { await cloudinary.uploader.destroy(blog.coverImagePublicId); } catch {}
        }
        const result = await uploadBufferToCloudinary(req.file.buffer, {
          transformation: [{ width: 1200, height: 675, crop: "fill", quality: "auto" }],
        });
        blog.coverImage = result.secure_url;
        blog.coverImagePublicId = result.public_id;
      } else if (coverImageUrl !== undefined) {
        // Admin explicitly set a URL (could be empty to clear)
        if (coverImageUrl !== blog.coverImage && blog.coverImagePublicId) {
          try { await cloudinary.uploader.destroy(blog.coverImagePublicId); } catch {}
          blog.coverImagePublicId = "";
        }
        blog.coverImage = coverImageUrl;
      }

      // Status & featured
      if (status) {
        if (status === "published" && blog.status !== "published") {
          blog.publishedAt = new Date();
        }
        blog.status = status;
      }

      const isFeatureBool = isFeatured === "true" || isFeatured === true;
      if (isFeatureBool && !blog.isFeatured) {
        await Blog.updateMany({ _id: { $ne: blog._id } }, { isFeatured: false });
      }
      blog.isFeatured = isFeatureBool;

      blog.updatedBy = req.user._id;
      await blog.save();

      res.status(200).json({ success: true, blog });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete blog
router.delete(
  "/admin/delete-blog/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return next(new ErrorHandler("Blog not found", 404));

      await blog.deleteOne();

      res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Toggle blog active status
router.put(
  "/admin/toggle-status/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return next(new ErrorHandler("Blog not found", 404));

      blog.isActive = !blog.isActive;
      blog.updatedBy = req.user._id;
      await blog.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        blog,
        message: `Blog ${blog.isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Set a blog as featured (only one at a time)
router.put(
  "/admin/toggle-featured/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return next(new ErrorHandler("Blog not found", 404));

      if (!blog.isFeatured) {
        // Unset all others, then set this one
        await Blog.updateMany({ _id: { $ne: blog._id } }, { isFeatured: false });
        blog.isFeatured = true;
      } else {
        blog.isFeatured = false;
      }
      blog.updatedBy = req.user._id;
      await blog.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        blog,
        message: blog.isFeatured
          ? "Blog set as featured"
          : "Blog removed from featured",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
