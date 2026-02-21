import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Paper,
  Switch,
  FormControlLabel,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Description as ArticleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as CloudUploadIcon,
  LinkOutlined as LinkIcon,
  Close as CloseIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import useBlog from "../../hooks/useBlog";

const BLOG_CATEGORIES = [
  "news",
  "tips",
  "guide",
  "announcement",
  "deals",
  "lifestyle",
  "technology",
  "other",
];

const STATUS_COLORS = {
  published: { label: "Published", color: "#059669", bg: "#D1FAE5" },
  draft: { label: "Draft", color: "#D97706", bg: "#FEF3C7" },
};

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "news",
  tags: [],
  status: "draft",
  isFeatured: false,
};

const AdminBlogManagement = () => {
  const {
    blogs,
    loading,
    total,
    totalPages,
    adminFetchBlogs,
    adminGetBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    setFeaturedBlog,
  } = useBlog();

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, blog: null });
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  });
  // Cover image upload state
  const [coverImageFile, setCoverImageFile] = useState(null); // File object
  const [coverImageFilePreview, setCoverImageFilePreview] = useState(""); // blob URL
  const [coverImageMode, setCoverImageMode] = useState("url"); // "url" | "file"

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const loadBlogs = useCallback(async () => {
    const result = await adminFetchBlogs({
      page,
      limit: 10,
      search: searchTerm,
      status: filterStatus,
      category: filterCategory,
    });
    if (result?.stats) setStats(result.stats);
  }, [adminFetchBlogs, page, searchTerm, filterStatus, filterCategory]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  // ─── Dialog Handlers ──────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingBlog(null);
    setFormData({ ...EMPTY_FORM });
    setTagInput("");
    setCoverImageFile(null);
    setCoverImageFilePreview("");
    setCoverImageMode("url");
    setOpenDialog(true);
  };

  const openEditDialog = async (blog) => {
    setEditingBlog(blog);
    const full = await adminGetBlog(blog._id);
    if (full) {
      setFormData({
        title: full.title || "",
        excerpt: full.excerpt || "",
        content: full.content || "",
        coverImage: full.coverImage || "",
        category: full.category || "news",
        tags: full.tags || [],
        status: full.status || "draft",
        isFeatured: full.isFeatured || false,
      });
    }
    setTagInput("");
    setCoverImageFile(null);
    setCoverImageFilePreview("");
    setCoverImageMode("url");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBlog(null);
    setFormData({ ...EMPTY_FORM });
    setCoverImageFile(null);
    if (coverImageFilePreview) URL.revokeObjectURL(coverImageFilePreview);
    setCoverImageFilePreview("");
    setCoverImageMode("url");
  };

  // ─── Form Helpers ─────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverImageFilePreview) URL.revokeObjectURL(coverImageFilePreview);
    const preview = URL.createObjectURL(file);
    setCoverImageFile(file);
    setCoverImageFilePreview(preview);
  };

  const handleClearFile = () => {
    if (coverImageFilePreview) URL.revokeObjectURL(coverImageFilePreview);
    setCoverImageFile(null);
    setCoverImageFilePreview("");
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // ─── CRUD Actions ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    try {
      const payload = { ...formData };
      if (coverImageMode === "file" && coverImageFile) {
        payload.coverImageFile = coverImageFile;
        payload.coverImage = ""; // let backend use uploaded file
      }
      if (editingBlog) {
        await updateBlog(editingBlog._id, payload);
      } else {
        await createBlog(payload);
      }
      handleCloseDialog();
      loadBlogs();
    } catch {
      // error already toasted in hook
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.blog) return;
    try {
      await deleteBlog(deleteDialog.blog._id);
      setDeleteDialog({ open: false, blog: null });
      loadBlogs();
    } catch {
      // error already toasted
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      await toggleBlogStatus(blog._id);
      loadBlogs();
    } catch {
      // error already toasted
    }
  };

  const handleToggleFeatured = async (blog) => {
    try {
      await setFeaturedBlog(blog._id);
      loadBlogs();
    } catch {
      // error already toasted
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
              <ArticleIcon style={{ color: "white", fontSize: 22 }} />
            </div>
            Blog Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create and manage blog posts shown to your users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <VisibilityIcon style={{ fontSize: 16 }} />
            View Blog
          </Link>
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <AddIcon style={{ fontSize: 18 }} />
            New Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: stats.total, color: "from-blue-500 to-indigo-600" },
          { label: "Published", value: stats.published, color: "from-emerald-500 to-green-600" },
          { label: "Drafts", value: stats.draft, color: "from-amber-500 to-orange-600" },
          { label: "Total Views", value: (stats.totalViews || 0).toLocaleString(), color: "from-purple-500 to-pink-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
              {s.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              placeholder="Search by title or excerpt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {BLOG_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#F8FAFC" }}>
                {["Cover", "Title", "Category", "Status", "Featured", "Views", "Published", "Actions"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      style={{ fontWeight: 700, color: "#475569", fontSize: 13 }}
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: "40px 0" }}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-slate-500 text-sm">Loading blogs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: "60px 0" }}>
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <ArticleIcon style={{ fontSize: 48, color: "#CBD5E1" }} />
                      <p className="font-medium text-slate-600">No blog posts found</p>
                      <p className="text-sm">Create your first post to get started.</p>
                      <button
                        onClick={openCreateDialog}
                        className="mt-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Create Post
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((b) => {
                  const statusStyle = STATUS_COLORS[b.status] || STATUS_COLORS.draft;
                  return (
                    <TableRow
                      key={b._id}
                      hover
                      style={{ borderBottom: "1px solid #F1F5F9" }}
                    >
                      {/* Cover */}
                      <TableCell>
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {b.coverImage ? (
                            <img
                              src={b.coverImage}
                              alt={b.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                              <ArticleIcon style={{ color: "#A5B4FC", fontSize: 20 }} />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Title */}
                      <TableCell style={{ maxWidth: 280 }}>
                        <p
                          className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2"
                          title={b.title}
                        >
                          {b.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 mr-1.5 text-amber-500">
                              <StarIcon style={{ fontSize: 14, color: "#F59E0B" }} />
                            </span>
                          )}
                          {b.title}
                        </p>
                        {b.excerpt && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {b.excerpt}
                          </p>
                        )}
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium capitalize">
                          {b.category}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            color: statusStyle.color,
                            backgroundColor: statusStyle.bg,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </TableCell>

                      {/* Featured */}
                      <TableCell>
                        <Tooltip title={b.isFeatured ? "Remove from Featured" : "Set as Featured"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleFeatured(b)}
                            style={{ color: b.isFeatured ? "#F59E0B" : "#CBD5E1" }}
                          >
                            {b.isFeatured ? (
                              <StarIcon fontSize="small" />
                            ) : (
                              <StarBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* Views */}
                      <TableCell>
                        <span className="text-sm text-slate-600 font-medium">
                          {(b.views || 0).toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Published */}
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {formatDate(b.publishedAt || b.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(b)}
                              style={{ color: "#6366F1" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={b.isActive ? "Set Inactive" : "Set Active"}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(b)}
                              style={{
                                color: b.isActive ? "#059669" : "#9CA3AF",
                              }}
                            >
                              {b.isActive ? (
                                <VisibilityIcon fontSize="small" />
                              ) : (
                                <VisibilityOffIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          {b.status === "published" && (
                            <Tooltip title="View Live">
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/blog/${b.slug}`}
                                target="_blank"
                                style={{ color: "#0EA5E9" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setDeleteDialog({ open: true, blog: b })
                              }
                              style={{ color: "#EF4444" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> &middot;{" "}
              <strong>{total}</strong> total posts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { borderRadius: 20, padding: 0 } }}
      >
        <DialogTitle
          style={{
            background: "linear-gradient(135deg, #6366F1, #9333EA)",
            color: "white",
            padding: "20px 24px",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
        </DialogTitle>

        <DialogContent style={{ padding: "24px" }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                variant="outlined"
                value={formData.title}
                onChange={handleChange("title")}
                inputProps={{ maxLength: 200 }}
                helperText={`${formData.title.length}/200`}
              />
            </Grid>

            {/* Excerpt */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Excerpt (short description)"
                variant="outlined"
                multiline
                rows={2}
                value={formData.excerpt}
                onChange={handleChange("excerpt")}
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.excerpt.length}/500 — Shown on listing cards`}
              />
            </Grid>

            {/* Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content * (HTML or plain text)"
                variant="outlined"
                multiline
                rows={8}
                value={formData.content}
                onChange={handleChange("content")}
                placeholder="Write your blog content here. You can use HTML tags like <h2>, <p>, <strong>, <ul>, <li>, <a>..."
                helperText="Supports HTML markup for rich formatting"
              />
            </Grid>

            {/* Cover Image — URL or File Upload */}
            <Grid item xs={12}>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Cover Image
              </p>
              {/* Mode toggle */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setCoverImageMode("url"); handleClearFile(); }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    coverImageMode === "url"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                  }`}
                >
                  <LinkIcon style={{ fontSize: 15 }} />
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImageMode("file")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    coverImageMode === "file"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                  }`}
                >
                  <CloudUploadIcon style={{ fontSize: 15 }} />
                  Upload File
                </button>
              </div>

              {coverImageMode === "url" ? (
                <>
                  <TextField
                    fullWidth
                    label="Cover Image URL"
                    variant="outlined"
                    value={formData.coverImage}
                    onChange={handleChange("coverImage")}
                    placeholder="https://example.com/image.jpg"
                    helperText="Supports jpg, jpeg, png, webp, avif and more. Leave blank to use a default."
                    size="small"
                  />
                  {formData.coverImage && (
                    <div className="mt-2 rounded-xl overflow-hidden h-36 bg-slate-100">
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 transition-colors relative overflow-hidden">
                    {coverImageFilePreview ? (
                      <>
                        <img
                          src={coverImageFilePreview}
                          alt="Preview"
                          className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Click to change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <CloudUploadIcon style={{ fontSize: 36, color: "#A5B4FC" }} />
                        <span className="text-sm font-medium text-slate-500">Click to upload image</span>
                        <span className="text-xs text-slate-400">JPG, JPEG, PNG, WEBP, AVIF, GIF (max 10MB)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,image/gif,image/bmp,image/svg+xml"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                  </label>
                  {coverImageFile && (
                    <div className="flex items-center justify-between mt-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                      <span className="text-xs text-indigo-700 font-medium truncate max-w-xs">
                        {coverImageFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="ml-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <CloseIcon style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </Grid>

            {/* Category & Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange("category")}
                  label="Category"
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange("status")}
                  label="Status"
                >
                  <MenuItem value="draft">Draft (not visible to users)</MenuItem>
                  <MenuItem value="published">Published (visible to users)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Featured toggle */}
            <Grid item xs={12}>
              <div
                className={`flex items-center justify-between px-5 py-3 rounded-xl border-2 transition-colors ${
                  formData.isFeatured
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <StarIcon
                    style={{
                      fontSize: 24,
                      color: formData.isFeatured ? "#F59E0B" : "#CBD5E1",
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Set as Featured Post
                    </p>
                    <p className="text-xs text-slate-500">
                      Featured post is prominently shown at the top of the blog page.
                      Only one blog can be featured at a time.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                  }
                  color="primary"
                />
              </div>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <div className="flex gap-2 items-center mb-2">
                <TextField
                  label="Add tag"
                  variant="outlined"
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. deals, tips"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    style={{ backgroundColor: "#EEF2FF", color: "#6366F1" }}
                  />
                ))}
              </div>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions style={{ padding: "16px 24px", gap: 12 }}>
          <button
            onClick={handleCloseDialog}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-60"
          >
            {editingBlog ? "Update Post" : "Create Post"}
          </button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, blog: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: 16 } }}
      >
        <DialogTitle style={{ fontWeight: 700, color: "#EF4444" }}>
          Delete Blog Post
        </DialogTitle>
        <DialogContent>
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete{" "}
            <strong>"{deleteDialog.blog?.title}"</strong>? This action cannot be
            undone.
          </p>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <button
            onClick={() => setDeleteDialog({ open: false, blog: null })}
            className="px-5 py-2 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminBlogManagement;
