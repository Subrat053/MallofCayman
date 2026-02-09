const express = require("express");
const router = express.Router();
const { isSeller, isAuthenticated, isAdmin, requirePermission, isSellerOrStoreManager, optionalSellerOrStoreManager } = require("../middleware/auth");
const { upload } = require("../multer");
const advertisementController = require("../controller/advertisement");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Public routes (with optional authentication for pricing check)
router.get("/pricing", advertisementController.getAdvertisementPricing);
router.post("/calculate-price", optionalSellerOrStoreManager, advertisementController.calculateAdvertisementPrice);
router.get("/available-slots/:adType", optionalSellerOrStoreManager, advertisementController.getAvailableSlots);
router.get("/active/:adType", advertisementController.getActiveAdvertisementsByType);
router.post("/track-view/:id", advertisementController.trackAdView);
router.post("/track-click/:id", advertisementController.trackAdClick);

// Vendor/Store Manager routes - Both can create and manage ads for their shop
router.post(
  "/create",
  isSellerOrStoreManager,
  upload.single('image'),
  advertisementController.createAdvertisement
);

router.post(
  "/process-payment",
  isSellerOrStoreManager,
  advertisementController.processAdvertisementPayment
);

router.get(
  "/vendor/my-ads",
  isSellerOrStoreManager,
  advertisementController.getVendorAdvertisements
);

router.get(
  "/vendor/analytics/:id",
  isSellerOrStoreManager,
  advertisementController.getAdvertisementAnalytics
);

router.put(
  "/vendor/cancel/:id",
  isSellerOrStoreManager,
  advertisementController.cancelAdvertisement
);

router.post(
  "/vendor/renew/:id",
  isSellerOrStoreManager,
  advertisementController.renewAdvertisement
);

router.put(
  "/vendor/auto-renew/:id",
  isSellerOrStoreManager,
  advertisementController.updateAutoRenew
);

// Get single advertisement for editing
router.get(
  "/vendor/ad/:id",
  isSellerOrStoreManager,
  advertisementController.getVendorAdvertisementById
);

// Update advertisement (before approval or if rejected)
router.put(
  "/vendor/update/:id",
  isSellerOrStoreManager,
  upload.single('image'),
  advertisementController.updateAdvertisement
);

// Admin routes - View all ads (SubAdmin can also view for approval purposes)
router.get(
  "/admin/all",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.getAllAdvertisements
);

// Admin routes - Plan management (Admin only - setup/configuration)
router.get(
  "/admin/plans",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.getAdPlans
);

router.put(
  "/admin/update-plan",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.updateAdPlan
);

router.put(
  "/admin/toggle-plan/:adType",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.toggleAdPlan
);

router.put(
  "/admin/toggle-free/:adType",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.toggleFreePlan
);

router.put(
  "/admin/update-discounts",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.updateDurationDiscounts
);

// Admin routes - Ad approval (SubAdmin can also approve/reject)
router.put(
  "/admin/approve/:id",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.approveAdvertisement
);

router.put(
  "/admin/reject/:id",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.rejectAdvertisement
);

module.exports = router;
