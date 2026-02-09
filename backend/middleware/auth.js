const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const StoreManagerService = require("../model/storeManager");
const { isAdminRole, hasPermission } = require("../utils/rolePermissions");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded.id);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if user's role was changed after the token was issued
  if (user.roleChangedAt && user.roleChangedAt > new Date(decoded.iat * 1000)) {
    return next(new ErrorHandler("Your role has been changed. Please log in again.", 401));
  }

  // Prevent suppliers from using user login - they should use shop login
  if (user.role === "Supplier") {
    return next(new ErrorHandler("Suppliers must login through shop login. Please use shop login to access your dashboard.", 401));
  }

  // Check if user is banned
  if (user.isBanned) {
    return next(new ErrorHandler(`Your account has been banned. Reason: ${user.banReason}`, 403));
  }

  req.user = user;
  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { seller_token } = req.cookies;
  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  const shop = await Shop.findById(decoded.id);
  
  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  // Check if there's a user with this email
  const user = await User.findOne({ email: shop.email });
  
  console.log(`[SELLER AUTH] Shop email: ${shop.email}`);
  console.log(`[SELLER AUTH] User found:`, user ? `Yes, role: ${user.role}` : 'No');
  
  // If user exists, validate their role
  if (user) {
    // Allow Supplier and User roles, block others (like Admin)
    if (!['Supplier', 'User'].includes(user.role)) {
      console.log(`[SELLER AUTH] Blocking access for role: ${user.role}`);
      return next(new ErrorHandler("Access denied. Your role has been changed. Please login with your current role.", 401));
    }
    console.log(`[SELLER AUTH] Allowing access for role: ${user.role}`);
  } else {
    console.log(`[SELLER AUTH] No user found with email, allowing shop-only access`);
  }
  // If no user exists with this email, it's a shop-only registration, which is fine

  // Don't block login for banned shops - let them access dashboard to see ban message
  // The ban check will be handled in the frontend components
  
  // Note: We don't check approval status here because sellers should be able to access
  // their dashboard to see their approval status. The approval check is handled
  // during login in the shop controller.
  req.seller = shop;
  next();
});

// Middleware to check if seller is banned for operations (not for login/dashboard access)
exports.isSellerNotBanned = catchAsyncErrors(async (req, res, next) => {
  if (req.seller && req.seller.isBanned) {
    return next(new ErrorHandler(`Your shop has been banned. Reason: ${req.seller.banReason}`, 403));
  }
  next();
});

// Middleware to check if seller is approved for operations
exports.isSellerApproved = catchAsyncErrors(async (req, res, next) => {
  if (!req.seller) {
    return next(new ErrorHandler("Seller authentication required", 401));
  }
  
  if (req.seller.approvalStatus === 'pending') {
    return next(new ErrorHandler("Your shop is pending admin approval. You cannot perform this action until approved.", 403));
  }
  
  if (req.seller.approvalStatus === 'rejected') {
    return next(new ErrorHandler(`Your shop has been rejected. Reason: ${req.seller.rejectionReason || 'No reason provided'}`, 403));
  }
  
  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    // Check if user has any admin-level role
    if (!req.user || !isAdminRole(req.user.role)) {
      return next(
        new ErrorHandler("Access denied. Admin privileges required.", 403)
      );
    }
    
    // If specific roles are provided, check against them
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Access denied. ${req.user.role} cannot access this resource.`, 403)
      );
    }
    next();
  };
};

/**
 * Middleware to check if user has specific permission
 * Usage: requirePermission('canApproveVendors')
 */
exports.requirePermission = (permission) => {
  return catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", 401));
    }

    if (!hasPermission(req.user, permission)) {
      return next(
        new ErrorHandler(`Access denied. You don't have permission to ${permission}.`, 403)
      );
    }

    next();
  });
};

/**
 * Middleware to check if user has any of the specified permissions
 * Usage: requireAnyPermission(['canApproveVendors', 'canManageVendors'])
 */
exports.requireAnyPermission = (permissions) => {
  return catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", 401));
    }

    const hasAnyPerm = permissions.some(perm => hasPermission(req.user, perm));
    
    if (!hasAnyPerm) {
      return next(
        new ErrorHandler(`Access denied. Insufficient permissions.`, 403)
      );
    }

    next();
  });
};

// Why this auth?
// This auth is for the user to login and get the token
// This token will be used to access the protected routes like create, update, delete, etc. (autharization)

/**
 * Store Manager Authentication Middleware
 * Allows store managers to perform limited operations on their assigned shop
 */
exports.isStoreManager = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decoded.id);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role !== 'store_manager') {
    return next(new ErrorHandler("Store Manager access required", 403));
  }

  if (user.isBanned) {
    return next(new ErrorHandler(`Your account has been banned. Reason: ${user.banReason}`, 403));
  }

  // Get the store manager service and shop
  const service = await StoreManagerService.findOne({
    assignedManager: user._id,
    serviceStatus: 'active',
    suspendedByAdmin: false,
  }).populate('shop');

  if (!service) {
    return next(new ErrorHandler("You are not assigned as Store Manager to any shop", 403));
  }

  if (!service.shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  // Attach user and managed shop to request
  req.user = user;
  req.storeManager = {
    service,
    shop: service.shop,
    shopId: service.shop._id,
  };
  req.seller = service.shop; // For compatibility with existing seller-based routes

  next();
});

/**
 * Middleware to allow either Seller (shop owner) OR Store Manager
 * Used for routes like advertisements where both should have access
 * Sets req.seller to the shop for both cases
 */
exports.isSellerOrStoreManager = catchAsyncErrors(async (req, res, next) => {
  // First try seller_token (shop owner)
  const { seller_token, token } = req.cookies;
  
  if (seller_token) {
    // Shop owner authentication
    try {
      const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
      const shop = await Shop.findById(decoded.id);
      
      if (shop) {
        req.seller = shop;
        req.isShopOwner = true;
        return next();
      }
    } catch (error) {
      // Seller token invalid, continue to check store manager
    }
  }
  
  // Try store manager authentication via user token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      
      if (user && user.role === 'store_manager' && !user.isBanned) {
        const service = await StoreManagerService.findOne({
          assignedManager: user._id,
          serviceStatus: 'active',
          suspendedByAdmin: false,
        }).populate('shop');
        
        if (service && service.shop) {
          req.user = user;
          req.seller = service.shop;
          req.isStoreManager = true;
          req.storeManager = {
            service,
            shop: service.shop,
            shopId: service.shop._id,
          };
          return next();
        }
      }
    } catch (error) {
      // Token invalid
    }
  }
  
  return next(new ErrorHandler("Please login as a seller or store manager to continue", 401));
});

/**
 * Optional authentication for seller or store manager
 * Doesn't fail if not authenticated - just sets req.seller if possible
 * Useful for routes that can work without auth but benefit from knowing the seller
 */
exports.optionalSellerOrStoreManager = catchAsyncErrors(async (req, res, next) => {
  const { seller_token, token } = req.cookies;
  
  // Try seller_token first
  if (seller_token) {
    try {
      const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
      const shop = await Shop.findById(decoded.id);
      if (shop) {
        req.seller = shop;
        req.isShopOwner = true;
        return next();
      }
    } catch (error) {
      // Ignore - token invalid
    }
  }
  
  // Try store manager via user token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      
      if (user && user.role === 'store_manager' && !user.isBanned) {
        const service = await StoreManagerService.findOne({
          assignedManager: user._id,
          serviceStatus: 'active',
          suspendedByAdmin: false,
        }).populate('shop');
        
        if (service && service.shop) {
          req.user = user;
          req.seller = service.shop;
          req.isStoreManager = true;
          return next();
        }
      }
    } catch (error) {
      // Ignore - token invalid
    }
  }
  
  // Not authenticated, but that's okay for this optional middleware
  next();
});

/**
 * Store Manager Permission Check
 * Only allows specific operations for store managers
 * 
 * Allowed operations:
 * - products: add, edit, view
 * - inventory: manage stock levels
 * - orders: view, update fulfillment status
 * 
 * Restricted operations:
 * - store settings
 * - payment settings
 * - refunds
 * - store info/owner details
 */
const STORE_MANAGER_ALLOWED_OPERATIONS = [
  'products',      // Add, edit, view products
  'inventory',     // Manage stock
  'orders',        // View and fulfill orders
];

const STORE_MANAGER_RESTRICTED_OPERATIONS = [
  'store_settings',
  'payment_settings',
  'refunds',
  'store_info',
  'withdraw',
  'subscription',
  'categories',    // Shop-level category assignment
];

exports.storeManagerCan = (operation) => {
  return catchAsyncErrors(async (req, res, next) => {
    // If it's a regular seller, allow all operations
    if (req.seller && !req.storeManager) {
      return next();
    }

    // If it's a store manager, check if operation is allowed
    if (req.storeManager) {
      if (STORE_MANAGER_RESTRICTED_OPERATIONS.includes(operation)) {
        return next(new ErrorHandler(
          "Store Managers cannot access this feature. Please contact the store owner.",
          403
        ));
      }

      if (STORE_MANAGER_ALLOWED_OPERATIONS.includes(operation) || !STORE_MANAGER_RESTRICTED_OPERATIONS.includes(operation)) {
        return next();
      }

      return next(new ErrorHandler("Operation not permitted for Store Managers", 403));
    }

    // Not a seller or store manager
    return next(new ErrorHandler("Authorization required", 403));
  });
};

/**
 * Combined Seller or Store Manager auth
 * Allows either shop owner or their assigned store manager to access
 */
exports.isSellerOrStoreManager = catchAsyncErrors(async (req, res, next) => {
  // First try seller token
  const { seller_token, token } = req.cookies;

  if (seller_token) {
    // Seller authentication
    try {
      const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
      const shop = await Shop.findById(decoded.id);
      
      if (shop) {
        if (shop.isBanned) {
          return next(new ErrorHandler(`Your shop has been banned. Reason: ${shop.banReason}`, 403));
        }
        req.seller = shop;
        req.isShopOwner = true;
        return next();
      }
    } catch (e) {
      // Continue to try store manager auth
    }
  }

  if (token) {
    // Try store manager authentication
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      
      if (user && user.role === 'store_manager') {
        const service = await StoreManagerService.findOne({
          assignedManager: user._id,
          serviceStatus: 'active',
          suspendedByAdmin: false,
        }).populate('shop');

        if (service && service.shop) {
          req.user = user;
          req.seller = service.shop;
          req.storeManager = {
            service,
            shop: service.shop,
            shopId: service.shop._id,
          };
          req.isShopOwner = false;
          return next();
        }
      }
    } catch (e) {
      // Continue to error
    }
  }

  return next(new ErrorHandler("Please login as shop owner or store manager", 401));
});
