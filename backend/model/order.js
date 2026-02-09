const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // Allows existing orders without this field
  },
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  shopId: {
    type: String,
    required: false,
  },
  shopName: {
    type: String,
    required: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  subTotalPrice: {
    type: Number,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  
  // ==========================================
  // DELIVERY SETUP FIELDS (Mall of Cayman SRS)
  // ==========================================
  
  // Delivery method: COLLECT (Pickup) or DELIVERY
  deliveryMethod: {
    type: String,
    enum: ["COLLECT", "DELIVERY"],
    default: "COLLECT",
  },
  
  // District information (required if deliveryMethod is DELIVERY)
  deliveryDistrict: {
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    districtName: {
      type: String,
    },
    districtCode: {
      type: String,
    },
  },
  
  // Delivery fee amount (required if deliveryMethod is DELIVERY)
  deliveryFeeAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Delivery provider type - for future Mall-managed delivery
  deliveryProviderType: {
    type: String,
    enum: ["VENDOR", "MALL"],
    default: "VENDOR",
  },
  
  // Timestamp when delivery choice was made
  deliveryChoiceTimestamp: {
    type: Date,
  },
  
  // Pickup/Collection details (if COLLECT is chosen)
  pickupDetails: {
    pickupAddress: String,
    pickupInstructions: String,
    scheduledPickupTime: Date,
  },
  
  // ==========================================
  status: {
    type: String,
    default: "Processing",
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  }],
  trackingNumber: {
    type: String
  },
  courierPartner: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Add initial status to history when order is created
orderSchema.pre('save', function(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: this.createdAt,
      note: 'Order placed successfully'
    });
  }
  next();
});

// Auto-generate arithmetic order numbers for new orders
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Get the total count of existing orders
      const count = await this.constructor.countDocuments();
      
      // Generate order number with format: wanttar-00001, wanttar-00002, etc.
      this.orderNumber = `wanttar-${String(count + 1).padStart(5, '0')}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
