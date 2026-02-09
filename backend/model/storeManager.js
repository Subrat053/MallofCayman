const mongoose = require("mongoose");

/**
 * Store Manager Service Model
 * 
 * This model tracks the Store Manager service subscription.
 * - Vendors purchase the service ($100/month subscription)
 * - Service is active for one month from purchase date
 * - Can be renewed monthly
 * - Once activated, vendors can assign a user as Store Manager
 * - Store Managers have limited permissions (products, inventory, orders only)
 */
const storeManagerServiceSchema = new mongoose.Schema({
  // The shop/vendor that owns this service
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true, // One service record per shop
  },

  // Service status
  serviceStatus: {
    type: String,
    enum: ['inactive', 'active', 'expired', 'suspended'],
    default: 'inactive',
  },

  // Subscription dates
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  
  // Auto-renewal setting
  autoRenew: {
    type: Boolean,
    default: false,
  },

  // Purchase info
  purchaseInfo: {
    purchaseDate: {
      type: Date,
    },
    amount: {
      type: Number,
      default: 100, // $100/month
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'admin_assigned', 'free_trial'],
      default: 'paypal',
    },
    paypalOrderId: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    purchasedDuringRegistration: {
      type: Boolean,
      default: false,
    },
  },

  // Payment history for subscription renewals
  paymentHistory: [
    {
      amount: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      transactionId: {
        type: String,
      },
      paymentMethod: {
        type: String,
      },
      periodStart: {
        type: Date,
      },
      periodEnd: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['success', 'failed', 'refunded'],
        default: 'success',
      },
    },
  ],

  // Currently assigned Store Manager
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Manager assignment details
  managerAssignment: {
    assignedAt: {
      type: Date,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop", // Shop owner who assigned the manager
    },
  },

  // Manager history (for audit trail)
  managerHistory: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      action: {
        type: String,
        enum: ['assigned', 'removed', 'suspended'],
      },
      actionDate: {
        type: Date,
        default: Date.now,
      },
      actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
      reason: {
        type: String,
      },
    },
  ],

  // Order notification settings
  notificationSettings: {
    sendEmailToManager: {
      type: Boolean,
      default: true,
    },
    sendEmailToOwner: {
      type: Boolean,
      default: true,
    },
  },

  // Admin suspension
  suspendedByAdmin: {
    type: Boolean,
    default: false,
  },
  suspensionReason: {
    type: String,
  },
  suspendedAt: {
    type: Date,
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who suspended
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

// Update timestamp on save
storeManagerServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if service is active (includes expiration check)
storeManagerServiceSchema.methods.isServiceActive = function() {
  if (this.suspendedByAdmin) return false;
  if (this.serviceStatus !== 'active') return false;
  
  // Check if subscription has expired
  if (this.subscriptionEndDate && new Date() > new Date(this.subscriptionEndDate)) {
    return false;
  }
  
  return true;
};

// Method to check if subscription is expired
storeManagerServiceSchema.methods.isExpired = function() {
  if (!this.subscriptionEndDate) return false;
  return new Date() > new Date(this.subscriptionEndDate);
};

// Method to get days remaining
storeManagerServiceSchema.methods.getDaysRemaining = function() {
  if (!this.subscriptionEndDate) return 0;
  const now = new Date();
  const end = new Date(this.subscriptionEndDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Method to check if a manager is assigned
storeManagerServiceSchema.methods.hasManager = function() {
  return this.isServiceActive() && this.assignedManager !== null;
};

// Static method to check if a user is a store manager for any shop
storeManagerServiceSchema.statics.findByManager = async function(userId) {
  const service = await this.findOne({
    assignedManager: userId,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  }).populate('shop');
  
  // Also check if subscription is still valid
  if (service && service.subscriptionEndDate && new Date() > new Date(service.subscriptionEndDate)) {
    return null;
  }
  
  return service;
};

// Static method to get or create service record for a shop
storeManagerServiceSchema.statics.getOrCreateForShop = async function(shopId) {
  let service = await this.findOne({ shop: shopId });
  if (!service) {
    service = await this.create({ shop: shopId });
  }
  return service;
};

// Static method to check and update expired subscriptions
storeManagerServiceSchema.statics.updateExpiredSubscriptions = async function() {
  const now = new Date();
  const result = await this.updateMany(
    {
      serviceStatus: 'active',
      subscriptionEndDate: { $lt: now },
    },
    {
      $set: { serviceStatus: 'expired' }
    }
  );
  return result;
};

module.exports = mongoose.model("StoreManagerService", storeManagerServiceSchema);
