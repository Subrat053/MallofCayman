const express = require("express");
const VendorDeliveryConfig = require("../model/vendorDeliveryConfig");
const District = require("../model/district");
const Shop = require("../model/shop");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/v2/vendor-delivery/config/:shopId
 * @desc    Get vendor's delivery configuration (public - for checkout)
 * @access  Public
 */
router.get(
  "/config/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      
      let config = await VendorDeliveryConfig.findOne({ shopId })
        .populate("districtFees.districtId", "name code isActive");
      
      // If no config exists, return defaults
      if (!config) {
        const shop = await Shop.findById(shopId);
        if (!shop) {
          return next(new ErrorHandler("Shop not found", 404));
        }
        
        return res.status(200).json({
          success: true,
          config: {
            shopId,
            deliveryEnabled: false,
            pickupEnabled: true,
            districtFees: [],
            hasNoConfig: true,
          },
        });
      }
      
      // Filter out inactive districts from response
      const filteredConfig = config.toObject();
      filteredConfig.districtFees = filteredConfig.districtFees.filter(
        df => df.districtId && df.districtId.isActive !== false
      );
      
      res.status(200).json({
        success: true,
        config: filteredConfig,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   GET /api/v2/vendor-delivery/my-config
 * @desc    Get seller's own delivery configuration
 * @access  Seller
 */
router.get(
  "/my-config",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      
      let config = await VendorDeliveryConfig.findOne({ shopId });
      
      // Get all active districts for reference
      const allDistricts = await District.getActiveDistricts();
      
      // If no config exists, create a default one
      if (!config) {
        config = await VendorDeliveryConfig.create({
          shopId,
          deliveryEnabled: false,
          pickupEnabled: true,
          districtFees: [],
          pickupAddress: req.seller.address || "",
        });
      }
      
      res.status(200).json({
        success: true,
        config,
        allDistricts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/vendor-delivery/save-config
 * @desc    Save/update vendor's delivery configuration
 * @access  Seller
 */
router.post(
  "/save-config",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const {
        deliveryEnabled,
        pickupEnabled,
        districtFees,
        defaultDeliveryFee,
        freeDeliveryThreshold,
        pickupAddress,
        pickupInstructions,
      } = req.body;
      
      let config = await VendorDeliveryConfig.findOne({ shopId });
      
      if (!config) {
        config = new VendorDeliveryConfig({ shopId });
      }
      
      // Update basic settings
      if (deliveryEnabled !== undefined) config.deliveryEnabled = deliveryEnabled;
      if (pickupEnabled !== undefined) config.pickupEnabled = pickupEnabled;
      if (defaultDeliveryFee !== undefined) config.defaultDeliveryFee = defaultDeliveryFee;
      if (freeDeliveryThreshold !== undefined) config.freeDeliveryThreshold = freeDeliveryThreshold;
      if (pickupAddress !== undefined) config.pickupAddress = pickupAddress;
      if (pickupInstructions !== undefined) config.pickupInstructions = pickupInstructions;
      
      // Update district fees if provided
      if (districtFees && Array.isArray(districtFees)) {
        // Validate each district fee
        const validDistrictFees = [];
        
        for (const df of districtFees) {
          // Validate district exists and is active
          const district = await District.findById(df.districtId);
          if (!district || !district.isActive) {
            continue; // Skip invalid/inactive districts
          }
          
          // Validate fee is numeric and >= 0
          const fee = parseFloat(df.fee);
          if (isNaN(fee) || fee < 0) {
            continue; // Skip invalid fees
          }
          
          validDistrictFees.push({
            districtId: df.districtId,
            districtName: district.name,
            districtCode: district.code,
            fee: fee,
            isAvailable: df.isAvailable !== false,
            estimatedDays: df.estimatedDays || district.defaultEstimatedDays,
          });
        }
        
        config.districtFees = validDistrictFees;
      }
      
      // Validation: If delivery is enabled but no districts configured, warn
      if (config.deliveryEnabled && !config.hasConfiguredDistricts()) {
        // Don't fail, but add a warning
        console.log(`Warning: Shop ${shopId} has delivery enabled but no districts configured`);
      }
      
      await config.save();
      
      res.status(200).json({
        success: true,
        message: "Delivery configuration saved successfully",
        config,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   PUT /api/v2/vendor-delivery/toggle-delivery
 * @desc    Toggle delivery on/off for vendor
 * @access  Seller
 */
router.put(
  "/toggle-delivery",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const { enabled } = req.body;
      
      let config = await VendorDeliveryConfig.findOne({ shopId });
      
      if (!config) {
        config = await VendorDeliveryConfig.create({
          shopId,
          deliveryEnabled: enabled,
          pickupEnabled: true,
        });
      } else {
        config.deliveryEnabled = enabled;
        await config.save();
      }
      
      res.status(200).json({
        success: true,
        message: enabled ? "Delivery enabled" : "Delivery disabled",
        deliveryEnabled: config.deliveryEnabled,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   PUT /api/v2/vendor-delivery/set-district-fee
 * @desc    Set delivery fee for a specific district
 * @access  Seller
 */
router.put(
  "/set-district-fee",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const { districtId, fee, isAvailable, estimatedDays } = req.body;
      
      // Validate district
      const district = await District.findById(districtId);
      if (!district || !district.isActive) {
        return next(new ErrorHandler("District not found or inactive", 404));
      }
      
      // Validate fee
      const parsedFee = parseFloat(fee);
      if (isNaN(parsedFee) || parsedFee < 0) {
        return next(new ErrorHandler("Fee must be a valid number >= 0", 400));
      }
      
      let config = await VendorDeliveryConfig.findOne({ shopId });
      
      if (!config) {
        config = new VendorDeliveryConfig({ shopId });
      }
      
      config.setDistrictFee(
        districtId,
        district.name,
        district.code,
        parsedFee,
        isAvailable !== false,
        estimatedDays
      );
      
      await config.save();
      
      res.status(200).json({
        success: true,
        message: `Delivery fee for ${district.name} updated`,
        config,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   DELETE /api/v2/vendor-delivery/remove-district/:districtId
 * @desc    Remove a district from vendor's delivery options
 * @access  Seller
 */
router.delete(
  "/remove-district/:districtId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const { districtId } = req.params;
      
      const config = await VendorDeliveryConfig.findOne({ shopId });
      
      if (!config) {
        return next(new ErrorHandler("Delivery configuration not found", 404));
      }
      
      config.removeDistrictFee(districtId);
      await config.save();
      
      res.status(200).json({
        success: true,
        message: "District removed from delivery options",
        config,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/vendor-delivery/check-delivery
 * @desc    Check if delivery is available for a specific shop and district
 * @access  Public (for checkout)
 */
router.post(
  "/check-delivery",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, districtId, orderTotal } = req.body;
      
      if (!shopId || !districtId) {
        return next(new ErrorHandler("Shop ID and District ID are required", 400));
      }
      
      const result = await VendorDeliveryConfig.getDeliveryFee(shopId, districtId, orderTotal || 0);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/vendor-delivery/get-delivery-options
 * @desc    Get all delivery options for a shop at checkout (districts with fees)
 * @access  Public (for checkout)
 */
router.post(
  "/get-delivery-options",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, orderTotal } = req.body;
      
      if (!shopId) {
        return next(new ErrorHandler("Shop ID is required", 400));
      }
      
      const config = await VendorDeliveryConfig.findOne({ shopId });
      
      // Default response if no config
      if (!config) {
        return res.status(200).json({
          success: true,
          deliveryEnabled: false,
          pickupEnabled: true,
          districts: [],
          pickupDetails: null,
        });
      }
      
      // Get available districts with fees
      const availableDistricts = config.districtFees
        .filter(df => df.isAvailable)
        .map(df => {
          let finalFee = df.fee;
          let freeDelivery = false;
          
          // Apply free delivery threshold
          if (config.freeDeliveryThreshold && orderTotal >= config.freeDeliveryThreshold) {
            finalFee = 0;
            freeDelivery = true;
          }
          
          return {
            districtId: df.districtId,
            districtName: df.districtName,
            districtCode: df.districtCode,
            fee: finalFee,
            originalFee: df.fee,
            freeDelivery,
            estimatedDays: df.estimatedDays,
          };
        });
      
      res.status(200).json({
        success: true,
        deliveryEnabled: config.deliveryEnabled,
        pickupEnabled: config.pickupEnabled,
        districts: config.deliveryEnabled ? availableDistricts : [],
        freeDeliveryThreshold: config.freeDeliveryThreshold,
        pickupDetails: config.pickupEnabled ? {
          address: config.pickupAddress,
          instructions: config.pickupInstructions,
        } : null,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * @route   POST /api/v2/vendor-delivery/bulk-set-fees
 * @desc    Bulk set fees for multiple districts at once
 * @access  Seller
 */
router.post(
  "/bulk-set-fees",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const { fees } = req.body;
      
      if (!fees || !Array.isArray(fees)) {
        return next(new ErrorHandler("Please provide an array of district fees", 400));
      }
      
      let config = await VendorDeliveryConfig.findOne({ shopId });
      
      if (!config) {
        config = new VendorDeliveryConfig({ shopId });
      }
      
      const results = { updated: [], failed: [] };
      
      for (const item of fees) {
        const { districtId, fee, isAvailable, estimatedDays } = item;
        
        try {
          const district = await District.findById(districtId);
          if (!district || !district.isActive) {
            results.failed.push({ districtId, reason: "District not found or inactive" });
            continue;
          }
          
          const parsedFee = parseFloat(fee);
          if (isNaN(parsedFee) || parsedFee < 0) {
            results.failed.push({ districtId, reason: "Invalid fee value" });
            continue;
          }
          
          config.setDistrictFee(
            districtId,
            district.name,
            district.code,
            parsedFee,
            isAvailable !== false,
            estimatedDays
          );
          
          results.updated.push({ districtId, districtName: district.name, fee: parsedFee });
        } catch (err) {
          results.failed.push({ districtId, reason: err.message });
        }
      }
      
      await config.save();
      
      res.status(200).json({
        success: true,
        message: `Updated ${results.updated.length} district fees`,
        results,
        config,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
