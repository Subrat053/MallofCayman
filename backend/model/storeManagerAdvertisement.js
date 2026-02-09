const mongoose = require("mongoose");

// Store Manager Advertisement Schema
// These ads are for store managers to manage their store's advertisements
// Separate from admin/vendor ads - managed by store manager for their assigned shop
const storeManagerAdvertisementSchema = new mongoose.Schema({
  // Shop Information (the shop the store manager manages)
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, "Shop ID is required"],
  },
  
  // Store Manager who created this ad
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Created by user is required"],
  },
  
  // Ad Type & Placement
  adType: {
    type: String,
    enum: [
      'store_banner',           // 728x120 - Banner on store page
      'store_sidebar',          // 300x200 - Sidebar on store page
      'product_highlight',      // Featured product promotion
      'store_announcement',     // Store-wide announcement
      'seasonal_promo',         // Seasonal/Holiday promotions
      'clearance_sale',         // Clearance/Sale promotions
      'new_arrival',            // New arrivals spotlight
      'flash_deal',             // Flash deal promotion
    ],
    required: [true, "Ad type is required"],
  },
  
  // Ad Content
  title: {
    type: String,
    required: [true, "Ad title is required"],
    maxLength: [100, "Title cannot exceed 100 characters"],
  },
  
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
  },
  
  // Image ad
  image: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  // Video ad (alternative to image)
  video: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  // Media type
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  
  // Link - where the ad points to
  linkUrl: {
    type: String,
    required: [true, "Link URL is required"],
  },
  
  // For product-specific ads
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  
  // Duration
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'expired', 'cancelled'],
    default: 'draft',
  },
  
  // Priority for display order
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  
  // Display settings
  displayOnStorePage: {
    type: Boolean,
    default: true,
  },
  
  displayOnProductPages: {
    type: Boolean,
    default: false,
  },
  
  // Target audience (optional)
  targetAudience: {
    type: String,
    enum: ['all', 'new_customers', 'returning_customers'],
    default: 'all',
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0,
  },
  
  clicks: {
    type: Number,
    default: 0,
  },
  
  clickThroughRate: {
    type: Number,
    default: 0,
  },
  
  // Last displayed
  lastDisplayedAt: {
    type: Date,
    default: null,
  },
  
  // Notes (internal)
  notes: {
    type: String,
    maxLength: [1000, "Notes cannot exceed 1000 characters"],
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
storeManagerAdvertisementSchema.index({ shopId: 1, status: 1 });
storeManagerAdvertisementSchema.index({ adType: 1, status: 1, startDate: 1 });
storeManagerAdvertisementSchema.index({ createdBy: 1 });

// Pre-save middleware
storeManagerAdvertisementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate CTR
  if (this.views > 0) {
    this.clickThroughRate = (this.clicks / this.views) * 100;
  }
  
  next();
});

// Static method to get ad type info
storeManagerAdvertisementSchema.statics.getAdTypeInfo = function() {
  return {
    store_banner: { 
      name: 'Store Banner', 
      size: '728x120', 
      description: 'Large banner at the top of your store page',
      position: 'Store page header'
    },
    store_sidebar: { 
      name: 'Store Sidebar', 
      size: '300x200', 
      description: 'Sidebar advertisement on store page',
      position: 'Store page sidebar'
    },
    product_highlight: { 
      name: 'Product Highlight', 
      size: 'Product Card', 
      description: 'Highlight a specific product',
      position: 'Featured section'
    },
    store_announcement: { 
      name: 'Store Announcement', 
      size: 'Text/Image', 
      description: 'Store-wide announcement banner',
      position: 'Store page top'
    },
    seasonal_promo: { 
      name: 'Seasonal Promo', 
      size: '728x120', 
      description: 'Seasonal or holiday promotion',
      position: 'Store page'
    },
    clearance_sale: { 
      name: 'Clearance Sale', 
      size: '728x120', 
      description: 'Clearance and sale promotion',
      position: 'Store page'
    },
    new_arrival: { 
      name: 'New Arrival', 
      size: '300x200', 
      description: 'Spotlight new products',
      position: 'Store page'
    },
    flash_deal: { 
      name: 'Flash Deal', 
      size: '300x200', 
      description: 'Time-limited flash deal',
      position: 'Store page'
    },
  };
};

// Method to check if ad is expired
storeManagerAdvertisementSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

// Method to check if ad is currently active
storeManagerAdvertisementSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate > now;
};

module.exports = mongoose.model("StoreManagerAdvertisement", storeManagerAdvertisementSchema);
