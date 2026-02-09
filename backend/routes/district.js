const express = require("express");
const District = require("../model/district");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/v2/district/all
 * @desc    Get all active districts (public)
 * @access  Public
 */
router.get(
  "/all",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const districts = await District.getActiveDistricts();
      
      res.status(200).json({
        success: true,
        districts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   GET /api/v2/district/admin/all
 * @desc    Get all districts including inactive (admin only)
 * @access  Admin
 */
router.get(
  "/admin/all",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const districts = await District.find().sort({ sortOrder: 1, name: 1 });
      
      res.status(200).json({
        success: true,
        districts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   GET /api/v2/district/:id
 * @desc    Get single district by ID
 * @access  Public
 */
router.get(
  "/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const district = await District.findById(req.params.id);
      
      if (!district) {
        return next(new ErrorHandler("District not found", 404));
      }
      
      res.status(200).json({
        success: true,
        district,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/district/create
 * @desc    Create a new district (admin only)
 * @access  Admin
 */
router.post(
  "/create",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, code, description, region, defaultDeliveryFee, defaultEstimatedDays, sortOrder } = req.body;
      
      // Validate required fields
      if (!name || !code) {
        return next(new ErrorHandler("District name and code are required", 400));
      }
      
      // Check for duplicate name or code
      const existingDistrict = await District.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, "i") } },
          { code: code.toUpperCase() }
        ]
      });
      
      if (existingDistrict) {
        return next(new ErrorHandler("District with this name or code already exists", 400));
      }
      
      const district = await District.create({
        name,
        code: code.toUpperCase(),
        description,
        region: region || "Cayman Islands",
        defaultDeliveryFee: defaultDeliveryFee || 0,
        defaultEstimatedDays: defaultEstimatedDays || 3,
        sortOrder: sortOrder || 0,
        createdBy: req.user._id,
      });
      
      res.status(201).json({
        success: true,
        message: "District created successfully",
        district,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   PUT /api/v2/district/update/:id
 * @desc    Update a district (admin only)
 * @access  Admin
 */
router.put(
  "/update/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, code, description, region, defaultDeliveryFee, defaultEstimatedDays, isActive, sortOrder } = req.body;
      
      const district = await District.findById(req.params.id);
      
      if (!district) {
        return next(new ErrorHandler("District not found", 404));
      }
      
      // Check for duplicate name or code (excluding current district)
      if (name || code) {
        const existingDistrict = await District.findOne({
          _id: { $ne: req.params.id },
          $or: [
            name ? { name: { $regex: new RegExp(`^${name}$`, "i") } } : null,
            code ? { code: code.toUpperCase() } : null,
          ].filter(Boolean)
        });
        
        if (existingDistrict) {
          return next(new ErrorHandler("District with this name or code already exists", 400));
        }
      }
      
      // Update fields
      if (name) district.name = name;
      if (code) district.code = code.toUpperCase();
      if (description !== undefined) district.description = description;
      if (region) district.region = region;
      if (defaultDeliveryFee !== undefined) district.defaultDeliveryFee = defaultDeliveryFee;
      if (defaultEstimatedDays !== undefined) district.defaultEstimatedDays = defaultEstimatedDays;
      if (isActive !== undefined) district.isActive = isActive;
      if (sortOrder !== undefined) district.sortOrder = sortOrder;
      district.updatedBy = req.user._id;
      
      await district.save();
      
      res.status(200).json({
        success: true,
        message: "District updated successfully",
        district,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   DELETE /api/v2/district/delete/:id
 * @desc    Soft delete a district (set isActive to false) - admin only
 * @access  Admin
 */
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const district = await District.findById(req.params.id);
      
      if (!district) {
        return next(new ErrorHandler("District not found", 404));
      }
      
      // Soft delete - just set isActive to false
      // This preserves historical orders that reference this district
      district.isActive = false;
      district.updatedBy = req.user._id;
      await district.save();
      
      res.status(200).json({
        success: true,
        message: "District deactivated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/district/bulk-create
 * @desc    Bulk create districts (admin only) - useful for initial setup
 * @access  Admin
 */
router.post(
  "/bulk-create",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { districts } = req.body;
      
      if (!districts || !Array.isArray(districts) || districts.length === 0) {
        return next(new ErrorHandler("Please provide an array of districts", 400));
      }
      
      const createdDistricts = [];
      const errors = [];
      
      for (let i = 0; i < districts.length; i++) {
        const { name, code, description, defaultDeliveryFee, defaultEstimatedDays } = districts[i];
        
        if (!name || !code) {
          errors.push({ index: i, error: "Name and code are required" });
          continue;
        }
        
        try {
          const district = await District.create({
            name,
            code: code.toUpperCase(),
            description,
            region: "Cayman Islands",
            defaultDeliveryFee: defaultDeliveryFee || 0,
            defaultEstimatedDays: defaultEstimatedDays || 3,
            sortOrder: i,
            createdBy: req.user._id,
          });
          createdDistricts.push(district);
        } catch (err) {
          errors.push({ index: i, name, error: err.message });
        }
      }
      
      res.status(201).json({
        success: true,
        message: `${createdDistricts.length} districts created successfully`,
        created: createdDistricts,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/district/seed-cayman
 * @desc    Seed default Cayman Islands districts (admin only)
 * @access  Admin
 */
router.post(
  "/seed-cayman",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Default Cayman Islands districts
      const caymanDistricts = [
        { name: "George Town", code: "GT", description: "Capital district", defaultDeliveryFee: 5, defaultEstimatedDays: 1, sortOrder: 1 },
        { name: "West Bay", code: "WB", description: "Northwestern district", defaultDeliveryFee: 7, defaultEstimatedDays: 1, sortOrder: 2 },
        { name: "Bodden Town", code: "BT", description: "Eastern district", defaultDeliveryFee: 8, defaultEstimatedDays: 2, sortOrder: 3 },
        { name: "North Side", code: "NS", description: "Northern district", defaultDeliveryFee: 10, defaultEstimatedDays: 2, sortOrder: 4 },
        { name: "East End", code: "EE", description: "Far eastern district", defaultDeliveryFee: 12, defaultEstimatedDays: 2, sortOrder: 5 },
        { name: "Cayman Brac", code: "CB", description: "Sister island - Cayman Brac", defaultDeliveryFee: 25, defaultEstimatedDays: 3, sortOrder: 6 },
        { name: "Little Cayman", code: "LC", description: "Sister island - Little Cayman", defaultDeliveryFee: 30, defaultEstimatedDays: 4, sortOrder: 7 },
      ];
      
      const createdDistricts = [];
      const skipped = [];
      
      for (const districtData of caymanDistricts) {
        // Check if already exists
        const exists = await District.findOne({
          $or: [
            { name: districtData.name },
            { code: districtData.code }
          ]
        });
        
        if (exists) {
          skipped.push(districtData.name);
          continue;
        }
        
        const district = await District.create({
          ...districtData,
          region: "Cayman Islands",
          createdBy: req.user._id,
        });
        createdDistricts.push(district);
      }
      
      res.status(201).json({
        success: true,
        message: `Seeded ${createdDistricts.length} Cayman Islands districts`,
        created: createdDistricts,
        skipped: skipped.length > 0 ? skipped : undefined,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   PUT /api/v2/district/reorder
 * @desc    Reorder districts (admin only)
 * @access  Admin
 */
router.put(
  "/reorder",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderedIds } = req.body;
      
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return next(new ErrorHandler("Please provide an array of district IDs in order", 400));
      }
      
      // Update sort order for each district
      for (let i = 0; i < orderedIds.length; i++) {
        await District.findByIdAndUpdate(orderedIds[i], { 
          sortOrder: i,
          updatedBy: req.user._id,
        });
      }
      
      const districts = await District.find().sort({ sortOrder: 1, name: 1 });
      
      res.status(200).json({
        success: true,
        message: "Districts reordered successfully",
        districts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
