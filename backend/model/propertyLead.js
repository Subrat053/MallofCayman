const mongoose = require("mongoose");

const propertyLeadSchema = new mongoose.Schema(
  {
    // Inquirer info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    // Which property this lead is for
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
    },
    // Inquiry type
    inquiryType: {
      type: String,
      enum: ["details", "visit", "general"],
      default: "details",
    },
    // Lead lifecycle
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
    // Admin notes
    adminNotes: {
      type: String,
      default: "",
    },
    // Email notification flags
    adminNotified: {
      type: Boolean,
      default: false,
    },
    userNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PropertyLead", propertyLeadSchema);
