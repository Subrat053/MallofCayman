const express = require("express");
const router = express.Router();
const { upload } = require("../multer");
const { isAuthenticated, isStoreManager } = require("../middleware/auth");
const storeManagerAdController = require("../controller/storeManagerAdvertisement");

// Get ad type info (authenticated)
router.get(
  "/ad-types",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getAdTypeInfo
);

// Get shop products for ad creation
router.get(
  "/shop-products",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getShopProducts
);

// Get shop ad fee status (for store manager to check exemption)
router.get(
  "/shop-ad-fee-status",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getShopAdFeeStatus
);

// Get shop ad statistics
router.get(
  "/statistics",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getShopAdStatistics
);

// Get all advertisements for store manager's shop
router.get(
  "/my-ads",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getMyAdvertisements
);

// Get single advertisement
router.get(
  "/ad/:id",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getAdvertisementById
);

// Get advertisement analytics
router.get(
  "/ad/:id/analytics",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.getAdvertisementAnalytics
);

// Create advertisement
router.post(
  "/create",
  isAuthenticated,
  isStoreManager,
  upload.single("media"),
  storeManagerAdController.createAdvertisement
);

// Update advertisement
router.put(
  "/ad/:id",
  isAuthenticated,
  isStoreManager,
  upload.single("media"),
  storeManagerAdController.updateAdvertisement
);

// Toggle advertisement status
router.put(
  "/ad/:id/status",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.toggleAdvertisementStatus
);

// Duplicate advertisement
router.post(
  "/ad/:id/duplicate",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.duplicateAdvertisement
);

// Delete advertisement
router.delete(
  "/ad/:id",
  isAuthenticated,
  isStoreManager,
  storeManagerAdController.deleteAdvertisement
);

// Public routes for tracking
router.post("/track/view/:id", storeManagerAdController.trackAdView);
router.post("/track/click/:id", storeManagerAdController.trackAdClick);

// Public route to get active ads for a shop
router.get("/shop/:shopId/active", storeManagerAdController.getActiveAdsForShop);

module.exports = router;
