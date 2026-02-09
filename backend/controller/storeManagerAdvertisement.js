const StoreManagerAdvertisement = require("../model/storeManagerAdvertisement");
const StoreManagerService = require("../model/storeManager");
const Shop = require("../model/shop");
const Product = require("../model/product");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Get ad type information (public)
exports.getAdTypeInfo = catchAsyncErrors(async (req, res, next) => {
  const adTypeInfo = StoreManagerAdvertisement.getAdTypeInfo();
  
  const adTypes = Object.keys(adTypeInfo).map(type => ({
    adType: type,
    ...adTypeInfo[type],
  }));
  
  res.status(200).json({
    success: true,
    adTypes,
  });
});

// Create advertisement (Store Manager only)
exports.createAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const {
    adType,
    title,
    description,
    startDate,
    endDate,
    priority,
    displayOnStorePage,
    displayOnProductPages,
    targetAudience,
    productId,
    notes,
    status,
  } = req.body;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  }).populate('shop');
  
  if (!storeManagerService || !storeManagerService.shop) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const shop = storeManagerService.shop;
  
  // Verify product belongs to this shop (for product-specific ads)
  if (productId) {
    const product = await Product.findById(productId);
    if (!product || product.shopId.toString() !== shop._id.toString()) {
      return next(new ErrorHandler("Product not found or doesn't belong to your shop", 404));
    }
  }
  
  // Handle media upload
  let imageData = null;
  let videoData = null;
  let mediaType = 'image';
  
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    mediaType = isVideo ? 'video' : 'image';
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'store-manager-advertisements',
      resource_type: isVideo ? 'video' : 'image',
    });
    
    if (isVideo) {
      videoData = {
        url: result.url,
        public_id: result.public_id,
      };
    } else {
      imageData = {
        url: result.url,
        public_id: result.public_id,
      };
    }
  }
  
  // Generate link URL
  let linkUrl = `/shop/${shop._id}`;
  if (productId) {
    linkUrl = `/product/${productId}`;
  }
  
  // Create advertisement
  const advertisement = new StoreManagerAdvertisement({
    shopId: shop._id,
    createdBy: req.user._id,
    adType,
    title,
    description,
    image: imageData,
    video: videoData,
    mediaType,
    linkUrl,
    productId: productId || null,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    priority: priority || 0,
    displayOnStorePage: displayOnStorePage !== false,
    displayOnProductPages: displayOnProductPages || false,
    targetAudience: targetAudience || 'all',
    notes: notes || '',
    status: status || 'draft',
  });
  
  await advertisement.save();
  
  res.status(201).json({
    success: true,
    message: "Advertisement created successfully",
    advertisement,
  });
});

// Get all advertisements for store manager's shop
exports.getMyAdvertisements = catchAsyncErrors(async (req, res, next) => {
  const { status, adType, page = 1, limit = 20 } = req.query;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const query = { shopId: storeManagerService.shop };
  if (status && status !== 'all') query.status = status;
  if (adType && adType !== 'all') query.adType = adType;
  
  const advertisements = await StoreManagerAdvertisement.find(query)
    .populate('productId', 'name images price')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await StoreManagerAdvertisement.countDocuments(query);
  
  res.status(200).json({
    success: true,
    advertisements,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    total: count,
  });
});

// Get single advertisement
exports.getAdvertisementById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const advertisement = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  }).populate('productId', 'name images price');
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  res.status(200).json({
    success: true,
    advertisement,
  });
});

// Update advertisement
exports.updateAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    startDate,
    endDate,
    priority,
    displayOnStorePage,
    displayOnProductPages,
    targetAudience,
    productId,
    notes,
    status,
  } = req.body;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const advertisement = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Update fields
  if (title) advertisement.title = title;
  if (description !== undefined) advertisement.description = description;
  if (startDate) advertisement.startDate = new Date(startDate);
  if (endDate) advertisement.endDate = new Date(endDate);
  if (priority !== undefined) advertisement.priority = priority;
  if (displayOnStorePage !== undefined) advertisement.displayOnStorePage = displayOnStorePage;
  if (displayOnProductPages !== undefined) advertisement.displayOnProductPages = displayOnProductPages;
  if (targetAudience) advertisement.targetAudience = targetAudience;
  if (notes !== undefined) advertisement.notes = notes;
  if (status) advertisement.status = status;
  
  // Update product link
  if (productId) {
    const product = await Product.findById(productId);
    if (product && product.shopId.toString() === storeManagerService.shop.toString()) {
      advertisement.productId = productId;
      advertisement.linkUrl = `/product/${productId}`;
    }
  } else if (productId === null) {
    advertisement.productId = null;
    advertisement.linkUrl = `/shop/${storeManagerService.shop}`;
  }
  
  // Handle media update
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Delete old media
    if (advertisement.image?.public_id) {
      await deleteFromCloudinary(advertisement.image.public_id);
    }
    if (advertisement.video?.public_id) {
      await deleteFromCloudinary(advertisement.video.public_id, 'video');
    }
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'store-manager-advertisements',
      resource_type: isVideo ? 'video' : 'image',
    });
    
    if (isVideo) {
      advertisement.video = { url: result.url, public_id: result.public_id };
      advertisement.image = { url: null, public_id: null };
      advertisement.mediaType = 'video';
    } else {
      advertisement.image = { url: result.url, public_id: result.public_id };
      advertisement.video = { url: null, public_id: null };
      advertisement.mediaType = 'image';
    }
  }
  
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: "Advertisement updated successfully",
    advertisement,
  });
});

// Delete advertisement
exports.deleteAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const advertisement = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Delete media from cloudinary
  if (advertisement.image?.public_id) {
    await deleteFromCloudinary(advertisement.image.public_id);
  }
  if (advertisement.video?.public_id) {
    await deleteFromCloudinary(advertisement.video.public_id, 'video');
  }
  
  await StoreManagerAdvertisement.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: "Advertisement deleted successfully",
  });
});

// Toggle advertisement status (active/paused)
exports.toggleAdvertisementStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const advertisement = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  if (!['active', 'paused', 'cancelled'].includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }
  
  advertisement.status = status;
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: `Advertisement ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'cancelled'} successfully`,
    advertisement,
  });
});

// Duplicate advertisement
exports.duplicateAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const originalAd = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  });
  
  if (!originalAd) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Create duplicate
  const newAd = new StoreManagerAdvertisement({
    shopId: originalAd.shopId,
    createdBy: req.user._id,
    adType: originalAd.adType,
    title: `${originalAd.title} (Copy)`,
    description: originalAd.description,
    image: originalAd.image,
    video: originalAd.video,
    mediaType: originalAd.mediaType,
    linkUrl: originalAd.linkUrl,
    productId: originalAd.productId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: originalAd.priority,
    displayOnStorePage: originalAd.displayOnStorePage,
    displayOnProductPages: originalAd.displayOnProductPages,
    targetAudience: originalAd.targetAudience,
    notes: originalAd.notes,
    status: 'draft',
  });
  
  await newAd.save();
  
  res.status(201).json({
    success: true,
    message: "Advertisement duplicated successfully",
    advertisement: newAd,
  });
});

// Get advertisement analytics
exports.getAdvertisementAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const advertisement = await StoreManagerAdvertisement.findOne({
    _id: id,
    shopId: storeManagerService.shop,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  const now = new Date();
  const daysRemaining = Math.ceil((advertisement.endDate - now) / (1000 * 60 * 60 * 24));
  
  res.status(200).json({
    success: true,
    analytics: {
      views: advertisement.views,
      clicks: advertisement.clicks,
      clickThroughRate: advertisement.clickThroughRate.toFixed(2) + '%',
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      status: advertisement.status,
      isActive: advertisement.isCurrentlyActive(),
      startDate: advertisement.startDate,
      endDate: advertisement.endDate,
    },
  });
});

// Get overall ad statistics for the shop
exports.getShopAdStatistics = catchAsyncErrors(async (req, res, next) => {
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const shopId = storeManagerService.shop;
  
  // Get counts by status
  const statusCounts = await StoreManagerAdvertisement.aggregate([
    { $match: { shopId: shopId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  
  // Get total views and clicks
  const totals = await StoreManagerAdvertisement.aggregate([
    { $match: { shopId: shopId } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
        totalAds: { $sum: 1 },
      },
    },
  ]);
  
  // Get ads by type
  const adsByType = await StoreManagerAdvertisement.aggregate([
    { $match: { shopId: shopId } },
    { $group: { _id: '$adType', count: { $sum: 1 } } },
  ]);
  
  // Format response
  const stats = {
    draft: 0,
    pending: 0,
    active: 0,
    paused: 0,
    expired: 0,
    cancelled: 0,
  };
  
  statusCounts.forEach(item => {
    stats[item._id] = item.count;
  });
  
  const adTypeStats = {};
  adsByType.forEach(item => {
    adTypeStats[item._id] = item.count;
  });
  
  res.status(200).json({
    success: true,
    statistics: {
      byStatus: stats,
      byType: adTypeStats,
      totals: totals[0] || { totalViews: 0, totalClicks: 0, totalAds: 0 },
      overallCTR: totals[0] && totals[0].totalViews > 0 
        ? ((totals[0].totalClicks / totals[0].totalViews) * 100).toFixed(2) + '%'
        : '0%',
    },
  });
});

// Track ad view (public)
exports.trackAdView = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  await StoreManagerAdvertisement.findByIdAndUpdate(id, {
    $inc: { views: 1 },
    lastDisplayedAt: new Date(),
  });
  
  res.status(200).json({ success: true });
});

// Track ad click (public)
exports.trackAdClick = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  await StoreManagerAdvertisement.findByIdAndUpdate(id, {
    $inc: { clicks: 1 },
  });
  
  res.status(200).json({ success: true });
});

// Get active ads for a shop (public - for display on store page)
exports.getActiveAdsForShop = catchAsyncErrors(async (req, res, next) => {
  const { shopId } = req.params;
  const { adType } = req.query;
  
  const now = new Date();
  
  const query = {
    shopId,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gt: now },
  };
  
  if (adType) {
    query.adType = adType;
  }
  
  const advertisements = await StoreManagerAdvertisement.find(query)
    .populate('productId', 'name images price discountPrice')
    .sort({ priority: -1, createdAt: -1 });
  
  res.status(200).json({
    success: true,
    advertisements,
  });
});

// Mark expired advertisements (cron job function)
exports.markExpiredAdvertisements = async () => {
  try {
    const result = await StoreManagerAdvertisement.updateMany(
      {
        status: 'active',
        endDate: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );
    
    console.log(`[Store Manager Ads] Marked ${result.modifiedCount} advertisements as expired`);
  } catch (error) {
    console.error('[Store Manager Ads] Error marking expired advertisements:', error);
  }
};

// Get shop products for ad creation
exports.getShopProducts = catchAsyncErrors(async (req, res, next) => {
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  });
  
  if (!storeManagerService) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const products = await Product.find({ 
    shopId: storeManagerService.shop,
    isActive: true,
  })
  .select('name images price discountPrice stock')
  .sort({ createdAt: -1 })
  .limit(100);
  
  res.status(200).json({
    success: true,
    products,
  });
});

// Get shop ad fee status (for store manager to see if their shop is exempt)
exports.getShopAdFeeStatus = catchAsyncErrors(async (req, res, next) => {
  // Get the store manager's assigned shop
  const storeManagerService = await StoreManagerService.findOne({
    assignedManager: req.user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  }).populate('shop', 'name isInHouseStore inHouseStoreNote adFeeExempt adFeeExemptReason');
  
  if (!storeManagerService || !storeManagerService.shop) {
    return next(new ErrorHandler("You are not assigned to any active shop", 403));
  }
  
  const shop = storeManagerService.shop;
  
  res.status(200).json({
    success: true,
    shop: {
      _id: shop._id,
      name: shop.name,
      isInHouseStore: shop.isInHouseStore || false,
      inHouseStoreNote: shop.inHouseStoreNote || '',
      adFeeExempt: shop.adFeeExempt || false,
      adFeeExemptReason: shop.adFeeExemptReason || '',
    }
  });
});
