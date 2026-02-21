const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    priceLabel: {
      type: String,
      default: "", // e.g., "per month" for rent
    },
    listingType: {
      type: String,
      required: [true, "Listing type is required"],
      enum: ["sale", "rent"],
      default: "sale",
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: [
        "house",
        "apartment",
        "land",
        "villa",
        "commercial",
        "office",
        "townhouse",
        "condo",
        "other",
      ],
      default: "house",
    },
    // Specs
    sqft: {
      type: Number,
      default: 0,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    garage: {
      type: Number,
      default: 0,
    },
    // Location
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      country: { type: String, default: "Cayman Islands" },
      zipCode: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    // Images
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],
    // Features / amenities  
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    // Status management
    status: {
      type: String,
      enum: ["active", "sold", "rented", "inactive"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Views count
    views: {
      type: Number,
      default: 0,
    },
    // Admin who created
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
propertySchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() +
      "-" +
      Date.now();
  }
  next();
});

module.exports = mongoose.model("Property", propertySchema);
