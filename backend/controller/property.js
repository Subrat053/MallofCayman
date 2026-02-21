const express = require("express");
const cloudinary = require("cloudinary").v2;
const {
  isAuthenticated,
  requirePermission,
} = require("../middleware/auth");
const Property = require("../model/property");
const PropertyLead = require("../model/propertyLead");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendMail = require("../utils/sendMail");

const router = express.Router();

// ─── Helper: upload buffer to Cloudinary ─────────────────────────────────────
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "real-estate/properties",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ─── GET all active properties with filters ───────────────────────────────────
router.get(
  "/get-properties",
  catchAsyncErrors(async (req, res, next) => {
    const {
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      city,
      search,
      page = 1,
      limit = 9,
      featured,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = { isActive: true, status: "active" };

    if (listingType && listingType !== "all") query.listingType = listingType;
    if (propertyType && propertyType !== "all") query.propertyType = propertyType;
    if (bedrooms && bedrooms !== "any") query.bedrooms = { $gte: parseInt(bedrooms) };
    if (featured === "true") query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v"),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      properties,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  })
);

// ─── GET single property by slug (public) ─────────────────────────────────────
router.get(
  "/get-property/:slug",
  catchAsyncErrors(async (req, res, next) => {
    const property = await Property.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }

    // Increment views
    property.views += 1;
    await property.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, property });
  })
);

// ─── GET property by ID (public) ──────────────────────────────────────────────
router.get(
  "/get-property-by-id/:id",
  catchAsyncErrors(async (req, res, next) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }
    res.status(200).json({ success: true, property });
  })
);

// ─── POST submit contact/lead form ────────────────────────────────────────────
router.post(
  "/submit-lead",
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, message, propertyId, inquiryType } = req.body;

    if (!name || !email || !phone || !message || !propertyId) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }

    // Save lead
    const lead = await PropertyLead.create({
      name,
      email,
      phone,
      message,
      property: propertyId,
      inquiryType: inquiryType || "details",
    });

    // Send email to admin
    try {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏠 New Property Inquiry</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #1e3a8a; font-size: 18px; margin-top: 0;">Inquiry Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 4px; color: #6b7280; font-weight: 600; width: 120px;">Property:</td><td style="padding: 8px 4px; color: #111827;">${property.title}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 8px 4px; color: #6b7280; font-weight: 600;">Inquiry Type:</td><td style="padding: 8px 4px; color: #111827; text-transform: capitalize;">${inquiryType || "Details"}</td></tr>
              <tr><td style="padding: 8px 4px; color: #6b7280; font-weight: 600;">Name:</td><td style="padding: 8px 4px; color: #111827;">${name}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 8px 4px; color: #6b7280; font-weight: 600;">Email:</td><td style="padding: 8px 4px; color: #111827;">${email}</td></tr>
              <tr><td style="padding: 8px 4px; color: #6b7280; font-weight: 600;">Phone:</td><td style="padding: 8px 4px; color: #111827;">${phone}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 8px 4px; color: #6b7280; font-weight: 600; vertical-align: top;">Message:</td><td style="padding: 8px 4px; color: #111827;">${message}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Lead ID:</strong> ${lead._id}<br>
                <strong>Submitted:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">Please follow up with the client as soon as possible.</p>
          </div>
        </div>`;

      await sendMail({
        email: process.env.SMPT_MAIL,
        subject: `New Property Inquiry: ${property.title}`,
        html: adminHtml,
        message: `New inquiry from ${name} (${email}, ${phone}) for property: ${property.title}. Message: ${message}`,
      });
      lead.adminNotified = true;
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr.message);
    }

    // Send confirmation email to user
    try {
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Thank You for Your Inquiry!</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <p style="color: #374151; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="color: #374151;">Thank you for reaching out! We have received your inquiry for:</p>
            <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 16px;">${property.title}</p>
              <p style="margin: 4px 0 0; color: #3b82f6; font-size: 14px;">${property.location?.city || ""}, ${property.location?.country || "Cayman Islands"}</p>
            </div>
            <p style="color: #374151;">Our team will review your request and contact you shortly. We aim to respond within <strong>24-48 hours</strong>.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              If you have any immediate questions, feel free to reach us directly.<br>
              <strong>Mall of Cayman — Real Estate</strong>
            </p>
          </div>
        </div>`;

      await sendMail({
        email,
        subject: "We received your property inquiry — Mall of Cayman",
        html: userHtml,
        message: `Dear ${name}, thank you for your inquiry for "${property.title}". Our team will contact you within 24-48 hours.`,
      });
      lead.userNotified = true;
    } catch (emailErr) {
      console.error("User confirmation email failed:", emailErr.message);
    }

    await lead.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Your inquiry has been submitted successfully. We will contact you shortly.",
      leadId: lead._id,
    });
  })
);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (Protected)
// ══════════════════════════════════════════════════════════════════════════════

// ─── GET all properties (admin, includes inactive) ───────────────────────────
router.get(
  "/admin/get-all-properties",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const { status, listingType, propertyType, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status && status !== "all") query.status = status;
    if (listingType && listingType !== "all") query.listingType = listingType;
    if (propertyType && propertyType !== "all") query.propertyType = propertyType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      properties,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  })
);

// ─── POST create property (admin) ─────────────────────────────────────────────
router.post(
  "/admin/create-property",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const {
      title,
      description,
      price,
      priceLabel,
      listingType,
      propertyType,
      sqft,
      bedrooms,
      bathrooms,
      garage,
      location,
      features,
      isFeatured,
      images, // array of base64 or URLs
    } = req.body;

    if (!title || !description || !price || !listingType || !propertyType) {
      return next(new ErrorHandler("Required fields are missing", 400));
    }

    // Process images
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.startsWith("data:")) {
          // base64 upload
          const result = await cloudinary.uploader.upload(img, {
            folder: "real-estate/properties",
            resource_type: "image",
          });
          uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
        } else if (img.startsWith("http")) {
          uploadedImages.push({ url: img, publicId: "" });
        }
      }
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    const slug = baseSlug + "-" + Date.now();

    const property = await Property.create({
      title,
      slug,
      description,
      price,
      priceLabel: priceLabel || "",
      listingType,
      propertyType,
      sqft: sqft || 0,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      garage: garage || 0,
      location: location || {},
      features: features || [],
      isFeatured: isFeatured || false,
      images: uploadedImages,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, property });
  })
);

// ─── PUT update property (admin) ──────────────────────────────────────────────
router.put(
  "/admin/update-property/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }

    const {
      title,
      description,
      price,
      priceLabel,
      listingType,
      propertyType,
      sqft,
      bedrooms,
      bathrooms,
      garage,
      location,
      features,
      isFeatured,
      status,
      isActive,
      images,        // new images to ADD (base64 or URL)
      keepImages,    // existing image objects to KEEP
    } = req.body;

    // Process new images
    let newUploaded = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.startsWith("data:")) {
          const result = await cloudinary.uploader.upload(img, {
            folder: "real-estate/properties",
            resource_type: "image",
          });
          newUploaded.push({ url: result.secure_url, publicId: result.public_id });
        } else if (img.startsWith("http")) {
          newUploaded.push({ url: img, publicId: "" });
        }
      }
    }

    // Merge kept images + new images
    const existingKept = keepImages || property.images;
    const mergedImages = [...existingKept, ...newUploaded];

    // Update fields
    if (title) {
      property.title = title;
      property.slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim() +
        "-" +
        Date.now();
    }
    if (description !== undefined) property.description = description;
    if (price !== undefined) property.price = price;
    if (priceLabel !== undefined) property.priceLabel = priceLabel;
    if (listingType !== undefined) property.listingType = listingType;
    if (propertyType !== undefined) property.propertyType = propertyType;
    if (sqft !== undefined) property.sqft = sqft;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;
    if (garage !== undefined) property.garage = garage;
    if (location !== undefined) property.location = location;
    if (features !== undefined) property.features = features;
    if (isFeatured !== undefined) property.isFeatured = isFeatured;
    if (status !== undefined) property.status = status;
    if (isActive !== undefined) property.isActive = isActive;
    property.images = mergedImages;

    await property.save();
    res.status(200).json({ success: true, property });
  })
);

// ─── PATCH update property status (admin) ────────────────────────────────────
router.patch(
  "/admin/update-status/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const { status, isActive } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }

    if (status) property.status = status;
    if (isActive !== undefined) property.isActive = isActive;
    await property.save();

    res.status(200).json({ success: true, property });
  })
);

// ─── DELETE property (admin) ──────────────────────────────────────────────────
router.delete(
  "/admin/delete-property/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new ErrorHandler("Property not found", 404));
    }

    // Delete images from cloudinary
    for (const img of property.images) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (e) {
          console.error("Cloudinary delete error:", e.message);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  })
);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN LEADS ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ─── GET all leads (admin) ─────────────────────────────────────────────────────
router.get(
  "/admin/get-leads",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const { status, propertyId, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status && status !== "all") query.status = status;
    if (propertyId) query.property = propertyId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [leads, total] = await Promise.all([
      PropertyLead.find(query)
        .populate("property", "title slug location listingType price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PropertyLead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      leads,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  })
);

// ─── PATCH update lead status (admin) ─────────────────────────────────────────
router.patch(
  "/admin/update-lead-status/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const { status, adminNotes } = req.body;
    const lead = await PropertyLead.findById(req.params.id);
    if (!lead) {
      return next(new ErrorHandler("Lead not found", 404));
    }

    if (status) lead.status = status;
    if (adminNotes !== undefined) lead.adminNotes = adminNotes;
    await lead.save();

    res.status(200).json({ success: true, lead });
  })
);

// ─── DELETE lead (admin) ──────────────────────────────────────────────────────
router.delete(
  "/admin/delete-lead/:id",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const lead = await PropertyLead.findById(req.params.id);
    if (!lead) {
      return next(new ErrorHandler("Lead not found", 404));
    }
    await PropertyLead.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Lead deleted successfully" });
  })
);

// ─── GET leads stats (admin) ──────────────────────────────────────────────────
router.get(
  "/admin/leads-stats",
  isAuthenticated,
  requirePermission("canManageContent"),
  catchAsyncErrors(async (req, res, next) => {
    const stats = await PropertyLead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalProperties = await Property.countDocuments({ isActive: true });
    const totalLeads = await PropertyLead.countDocuments();

    res.status(200).json({ success: true, stats, totalProperties, totalLeads });
  })
);

module.exports = router;
