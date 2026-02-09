const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlBody: {
      type: String,
      required: true,
    },
    // Available variables that can be used in this template
    availableVariables: [
      {
        variable: String, // e.g., "{{userName}}"
        description: String, // e.g., "User's full name"
        required: Boolean,
      },
    ],
    // Styling options
    styling: {
      primaryColor: {
        type: String,
        default: "#f97316", // Orange
      },
      secondaryColor: {
        type: String,
        default: "#1f2937", // Dark gray
      },
      backgroundColor: {
        type: String,
        default: "#f9fafb", // Light gray
      },
      fontFamily: {
        type: String,
        default: "Arial, sans-serif",
      },
      logoUrl: {
        type: String,
        default: "",
      },
      footerText: {
        type: String,
        default: "© 2026 Mall of Cayman. All rights reserved.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Store the default template for reset functionality
    defaultHtmlBody: {
      type: String,
    },
    defaultSubject: {
      type: String,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
emailTemplateSchema.index({ slug: 1 });
emailTemplateSchema.index({ isActive: 1 });

// Method to render template with variables
emailTemplateSchema.methods.render = function (variables = {}) {
  let renderedHtml = this.htmlBody;
  let renderedSubject = this.subject;

  // Replace all variables in the template
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    renderedHtml = renderedHtml.replace(regex, variables[key] || "");
    renderedSubject = renderedSubject.replace(regex, variables[key] || "");
  });

  // Apply styling
  renderedHtml = renderedHtml
    .replace(/{{primaryColor}}/g, this.styling.primaryColor)
    .replace(/{{secondaryColor}}/g, this.styling.secondaryColor)
    .replace(/{{backgroundColor}}/g, this.styling.backgroundColor)
    .replace(/{{fontFamily}}/g, this.styling.fontFamily)
    .replace(/{{logoUrl}}/g, this.styling.logoUrl)
    .replace(/{{footerText}}/g, this.styling.footerText);

  return {
    subject: renderedSubject,
    html: renderedHtml,
  };
};

// Static method to get template by slug
emailTemplateSchema.statics.getBySlug = async function (slug) {
  return await this.findOne({ slug, isActive: true });
};

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
