const mongoose = require("mongoose");

/**
 * District Model - Admin-managed delivery zones for Mall of Cayman
 * These are platform-wide districts that vendors can configure delivery fees for
 */
const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "District name is required"],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: [true, "District code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Geographic information
  region: {
    type: String,
    trim: true,
    default: "Cayman Islands",
  },
  // Default delivery settings (can be overridden by vendors)
  defaultDeliveryFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  defaultEstimatedDays: {
    type: Number,
    default: 3,
    min: 1,
    max: 30,
  },
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  // Sort order for display
  sortOrder: {
    type: Number,
    default: 0,
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
  // Admin who created/updated
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Pre-save middleware to update timestamp
districtSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
districtSchema.index({ isActive: 1, sortOrder: 1 });
districtSchema.index({ code: 1 });
districtSchema.index({ name: "text" });

// Static method to get all active districts
districtSchema.statics.getActiveDistricts = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to check if district exists
districtSchema.statics.districtExists = function (districtId) {
  return this.findOne({ _id: districtId, isActive: true });
};

module.exports = mongoose.model("District", districtSchema);
