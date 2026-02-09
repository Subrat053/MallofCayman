const mongoose = require("mongoose");

/**
 * Vendor Delivery Configuration Model
 * Stores per-vendor delivery settings including district-based fees
 * Supports future Mall-managed delivery (delivery_provider_type)
 */
const vendorDeliveryConfigSchema = new mongoose.Schema({
  // Shop/Vendor reference
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true,
  },
  
  // Global delivery toggle for the vendor
  deliveryEnabled: {
    type: Boolean,
    default: false,
  },
  
  // Delivery provider type - for future Mall-managed delivery
  // VENDOR = vendor handles delivery (Phase 1)
  // MALL = Mall of Cayman handles delivery (Future Phase)
  deliveryProviderType: {
    type: String,
    enum: ["VENDOR", "MALL"],
    default: "VENDOR",
  },
  
  // District-based delivery fees
  districtFees: [{
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    districtName: {
      type: String,
      required: true,
    },
    districtCode: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    // Whether delivery is available for this district
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Estimated delivery days for this district (optional override)
    estimatedDays: {
      type: Number,
      min: 1,
      max: 30,
    },
  }],
  
  // Default delivery settings
  defaultDeliveryFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Free delivery threshold (optional)
  freeDeliveryThreshold: {
    type: Number,
    default: null,
    min: 0,
  },
  
  // Pickup/Collection settings
  pickupEnabled: {
    type: Boolean,
    default: true, // Collection is always available by default
  },
  pickupAddress: {
    type: String,
    trim: true,
  },
  pickupInstructions: {
    type: String,
    trim: true,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware
vendorDeliveryConfigSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
vendorDeliveryConfigSchema.index({ shopId: 1 });
vendorDeliveryConfigSchema.index({ "districtFees.districtId": 1 });
vendorDeliveryConfigSchema.index({ deliveryEnabled: 1 });

/**
 * Static method to get vendor's delivery config
 */
vendorDeliveryConfigSchema.statics.getByShopId = async function (shopId) {
  return this.findOne({ shopId }).populate("districtFees.districtId");
};

/**
 * Static method to check if vendor offers delivery to a specific district
 */
vendorDeliveryConfigSchema.statics.canDeliverToDistrict = async function (shopId, districtId) {
  const config = await this.findOne({ 
    shopId, 
    deliveryEnabled: true,
    "districtFees.districtId": districtId,
    "districtFees.isAvailable": true,
  });
  
  if (!config) return { canDeliver: false };
  
  const districtFee = config.districtFees.find(
    df => df.districtId.toString() === districtId.toString() && df.isAvailable
  );
  
  if (!districtFee) return { canDeliver: false };
  
  return {
    canDeliver: true,
    fee: districtFee.fee,
    estimatedDays: districtFee.estimatedDays,
    districtName: districtFee.districtName,
  };
};

/**
 * Static method to get delivery fee for a district
 */
vendorDeliveryConfigSchema.statics.getDeliveryFee = async function (shopId, districtId, orderTotal = 0) {
  const config = await this.findOne({ shopId });
  
  if (!config || !config.deliveryEnabled) {
    return { available: false, reason: "Delivery not enabled for this vendor" };
  }
  
  const districtFee = config.districtFees.find(
    df => df.districtId.toString() === districtId.toString()
  );
  
  if (!districtFee || !districtFee.isAvailable) {
    return { available: false, reason: "Delivery not available for this district" };
  }
  
  let fee = districtFee.fee;
  
  // Apply free delivery threshold if applicable
  if (config.freeDeliveryThreshold && orderTotal >= config.freeDeliveryThreshold) {
    fee = 0;
  }
  
  return {
    available: true,
    fee,
    originalFee: districtFee.fee,
    freeDelivery: fee === 0,
    districtName: districtFee.districtName,
    estimatedDays: districtFee.estimatedDays,
  };
};

/**
 * Instance method to add/update district fee
 */
vendorDeliveryConfigSchema.methods.setDistrictFee = function (districtId, districtName, districtCode, fee, isAvailable = true, estimatedDays = null) {
  const existingIndex = this.districtFees.findIndex(
    df => df.districtId.toString() === districtId.toString()
  );
  
  const feeData = {
    districtId,
    districtName,
    districtCode,
    fee,
    isAvailable,
    estimatedDays,
  };
  
  if (existingIndex >= 0) {
    this.districtFees[existingIndex] = feeData;
  } else {
    this.districtFees.push(feeData);
  }
  
  return this;
};

/**
 * Instance method to remove district fee
 */
vendorDeliveryConfigSchema.methods.removeDistrictFee = function (districtId) {
  this.districtFees = this.districtFees.filter(
    df => df.districtId.toString() !== districtId.toString()
  );
  return this;
};

/**
 * Instance method to check if vendor has any districts configured
 */
vendorDeliveryConfigSchema.methods.hasConfiguredDistricts = function () {
  return this.districtFees.some(df => df.isAvailable);
};

module.exports = mongoose.model("VendorDeliveryConfig", vendorDeliveryConfigSchema);
