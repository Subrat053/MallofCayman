const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin, requirePermission, requireAnyPermission } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const NotificationService = require("../utils/NotificationService");
const { uploadImageToCloudinary, deleteFromCloudinary, uploadToCloudinary } = require("../config/cloudinary");
const EmailTemplate = require("../model/emailTemplate");

const sendShopToken = require("../utils/shopToken");
const { uploadShopRegistration } = require("../multer");

// create shop
router.post("/create-shop", uploadShopRegistration, async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    // Handle avatar upload
    let avatarData = null;
    if (req.files && req.files['file'] && req.files['file'][0]) {
      try {
        const avatarFile = req.files['file'][0];
        console.log(`Uploading shop avatar: ${avatarFile.originalname}`);
        const result = await uploadToCloudinary(avatarFile.buffer, {
          folder: 'shops/avatars',
          resource_type: 'image',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill'
          }
        });
        console.log(`Shop avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
      } catch (error) {
        console.error('Shop avatar upload error:', error);
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }
    }

    // Handle trade license uploads (mandatory)
    let tradeLicensesData = [];
    if (req.files && req.files['tradeLicenses'] && req.files['tradeLicenses'].length > 0) {
      try {
        console.log(`Uploading ${req.files['tradeLicenses'].length} trade license documents`);
        
        for (const licenseFile of req.files['tradeLicenses']) {
          const result = await uploadToCloudinary(licenseFile.buffer, {
            folder: 'shops/trade-licenses',
            resource_type: licenseFile.mimetype === 'application/pdf' ? 'raw' : 'image',
          });
          
          tradeLicensesData.push({
            url: result.url,
            public_id: result.public_id,
            originalName: licenseFile.originalname,
            uploadedAt: new Date()
          });
        }
        
        console.log(`Trade licenses uploaded successfully: ${tradeLicensesData.length} files`);
      } catch (error) {
        console.error('Trade license upload error:', error);
        return next(new ErrorHandler(`Trade license upload failed: ${error.message}`, 400));
      }
    } else {
      return next(new ErrorHandler("Trade and Business License documents are required", 400));
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      gstNumber: req.body.gstNumber,
      paypalEmail: req.body.paypalEmail, // REQUIRED
      wantStoreManager: req.body.wantStoreManager === 'true', // Store Manager service option
      tradeLicenses: tradeLicensesData, // Trade and Business License documents
      // Bank account details (optional)
      bankAccountDetails: {
        accountHolderName: req.body.accountHolderName || '',
        accountNumber: req.body.accountNumber || '',
        bankName: req.body.bankName || '',
        ifscCode: req.body.ifscCode || '',
        accountType: req.body.accountType || '',
      },
    };
    
    // Validate PayPal email is provided
    if (!seller.paypalEmail) {
      return next(new ErrorHandler("PayPal email is required to receive payments", 400));
    }
    
    // Only add avatar if it exists
    if (avatarData) {
      seller.avatar = avatarData;
    }

    const activationToken = createActivationToken(seller);

  //  const activationUrl = `https://www.mallofcayman.com/seller/activation/${activationToken}`;
   const activationUrl = `${process.env.APP_URL}/seller/activation/${activationToken}`;

    try {
      // Fetch the email template from database
      let template = await EmailTemplate.findOne({ slug: 'seller_activation' });
      
      let emailSubject, emailHtml;
      
      if (template) {
        // Use the template from database
        const variables = {
          shopName: seller.name,
          sellerName: seller.name,
          email: seller.email,
          activationUrl: activationUrl
        };
        // render() returns { subject, html }
        const rendered = template.render(variables);
        emailSubject = rendered.subject;
        emailHtml = rendered.html;
      } else {
        // Fallback to default styled HTML if template not found
        emailSubject = "Activate Your Shop - Mall of Cayman";
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🛍️ Mall of Cayman</h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Shop Smart, Shop Local</p>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Welcome, ${seller.name}! 🎉</h2>
                        <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Thank you for choosing Mall of Cayman as your selling platform! We're excited to have you join our community of local vendors.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Please click the button below to verify your email address and activate your shop:
                        </p>
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${activationUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                🏪 Activate My Shop
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                          Or copy and paste this link in your browser:<br>
                          <a href="${activationUrl}" style="color: #f97316; word-break: break-all;">${activationUrl}</a>
                        </p>
                        <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 14px;">
                          This link will expire in 24 hours.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          If you didn't create a shop, please ignore this email.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Mall of Cayman. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
      }
      
      await sendMail({
        email: seller.email,
        subject: emailSubject,
        message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        html: emailHtml,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${seller.email} to activate your shop!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "24h", // Extended from 30m to 24h for better user experience
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      if (!activation_token) {
        return next(new ErrorHandler("Activation token is required", 400));
      }

      let newSeller;
      try {
        newSeller = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return next(new ErrorHandler("Activation token has expired. Please register again.", 400));
        } else if (jwtError.name === 'JsonWebTokenError') {
          return next(new ErrorHandler("Invalid activation token. Please check your link.", 400));
        } else {
          return next(new ErrorHandler("Token verification failed. Please try again.", 400));
        }
      }

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber, latitude, longitude, gstNumber, wantStoreManager, tradeLicenses } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const shopData = {
        name,
        email,
        password,
        zipCode,
        address,
        phoneNumber,
        latitude,
        longitude,
        gstNumber,
        tradeLicenses: tradeLicenses || [], // Trade and Business License documents
      };

      // Only add avatar if it exists
      if (avatar) {
        shopData.avatar = avatar;
      }

      seller = await Shop.create(shopData);

      // Create notification for new seller registration requiring approval
      await NotificationService.createShopApprovalNotification(seller, "pending");

      // If vendor opted for Store Manager service during registration, create a pending service record
      if (wantStoreManager) {
        try {
          const StoreManagerService = require('../model/storeManagerService');
          await StoreManagerService.create({
            shop: seller._id,
            status: 'pending_payment',
            price: 100, // $100 USD as per SRS 3.2
          });
          console.log(`[SHOP] Created pending Store Manager service for shop: ${seller._id}`);
        } catch (smError) {
          console.error('[SHOP] Failed to create Store Manager service record:', smError);
          // Don't fail the registration, just log the error
        }
      }

      sendShopToken(seller, 201, res, wantStoreManager);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      console.log('[SHOP LOGIN] Attempting login for email:', email);
      
      // First, check if there's a user with Supplier role
      const User = require("../model/user");
      const supplierUser = await User.findOne({ email }).select("+password");
      
      if (supplierUser && supplierUser.role === 'Supplier') {
        console.log('[SHOP LOGIN] Found Supplier user, authenticating against user account...');
        
        const isPasswordValid = await supplierUser.comparePassword(password);
        
        if (!isPasswordValid) {
          console.log('[SHOP LOGIN] Invalid password for Supplier user:', email);
          return next(new ErrorHandler("Please provide the correct information", 400));
        }
        
        // Check if they have a shop profile, if not create one
        let shopProfile = await Shop.findOne({ email });
        
        if (!shopProfile) {
          console.log('[SHOP LOGIN] Creating shop profile for Supplier user...');
          shopProfile = await Shop.create({
            name: `${supplierUser.name}'s Shop`,
            email: supplierUser.email,
            password: 'temppassword123', // Won't be used for auth anymore
            description: `Welcome to ${supplierUser.name}'s shop`,
            address: "Please update your address",
            phoneNumber: 1234567890,
            zipCode: 123456,
            avatar: {
              url: supplierUser.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
              public_id: supplierUser.avatar?.public_id || "avatar_gfxgav"
            }
          });
          console.log('[SHOP LOGIN] Shop profile created:', shopProfile._id);
        }
        
        console.log('[SHOP LOGIN] Login successful for Supplier user:', email);
        // Send shop token using the shop profile but authenticated via user account
        sendShopToken(shopProfile, 201, res);
        return;
      }
      
      // If not a Supplier user, try traditional shop authentication
      console.log('[SHOP LOGIN] Not a Supplier user, trying traditional shop login...');
      const shopUser = await Shop.findOne({ email }).select("+password");

      if (!shopUser) {
        console.log('[SHOP LOGIN] No shop or supplier found for email:', email);
        return next(new ErrorHandler("User doesn't exist! If you were recently promoted to Supplier, please use your original user password.", 400));
      }

      console.log('[SHOP LOGIN] Traditional shop found:', shopUser._id);
      
      // Check approval status
      if (shopUser.approvalStatus === 'pending') {
        console.log('[SHOP LOGIN] Shop account pending approval:', email);
        return next(new ErrorHandler("Your shop account is pending admin approval. Please wait for approval before logging in.", 400));
      }
      
      if (shopUser.approvalStatus === 'rejected') {
        console.log('[SHOP LOGIN] Shop account rejected:', email);
        return next(new ErrorHandler(`Your shop account has been rejected. Reason: ${shopUser.rejectionReason || 'No reason provided'}`, 400));
      }
      
      const isPasswordValid = await shopUser.comparePassword(password);

      if (!isPasswordValid) {
        console.log('[SHOP LOGIN] Invalid password for traditional shop:', email);
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      console.log('[SHOP LOGIN] Traditional shop login successful for:', email);
      sendShopToken(shopUser, 201, res);
      
    } catch (error) {
      console.error('[SHOP LOGIN] Error:', error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      // Fetch subscription information - only active subscriptions count
      const Subscription = require("../model/subscription");
      const subscription = await Subscription.findOne({ 
        shop: seller._id,
        status: 'active' // Only fetch active subscriptions
      });
      
      // Add subscription details to seller object
      const sellerWithSubscription = seller.toObject();
      if (subscription) {
        sellerWithSubscription.subscription = subscription;
        sellerWithSubscription.subscriptionPlan = subscription.plan;
        sellerWithSubscription.subscriptionStatus = subscription.status;
        sellerWithSubscription.maxProducts = subscription.maxProducts;
        sellerWithSubscription.subscriptionFeatures = subscription.features;
      } else {
        // Default to free if no active subscription found
        sellerWithSubscription.subscriptionPlan = "free";
        sellerWithSubscription.subscriptionStatus = "none";
        sellerWithSubscription.maxProducts = 5;
      }

      res.status(200).json({
        success: true,
        seller: sellerWithSubscription,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isProduction = process.env.NODE_ENV === "PRODUCTION";
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all shops (public - for featured stores)
router.get(
  "/get-all-shops",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Get all approved and non-banned shops, sorted by ratings
      const shops = await Shop.find({
        approvalStatus: 'approved',
        isBanned: { $ne: true }
      })
        .select('name avatar ratings description address createdAt')
        .sort({ ratings: -1, createdAt: -1 })
        .limit(50);

      res.status(200).json({
        success: true,
        shops,
        count: shops.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return next(new ErrorHandler("No file uploaded", 400));
      }

      const existsUser = await Shop.findById(req.seller._id);

      // Upload new avatar to Cloudinary
      let avatarData = null;
      try {
        console.log(`Uploading updated shop avatar: ${req.file.originalname}`);
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'shops/avatars',
          resource_type: 'image',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill'
          }
        });
        console.log(`Updated shop avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
      } catch (error) {
        console.error('Shop avatar update upload error:', error);
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }

      // Delete previous avatar from Cloudinary if it exists
      if (existsUser.avatar && existsUser.avatar.public_id) {
        try {
          await deleteFromCloudinary(existsUser.avatar.public_id, 'image');
          console.log(`Deleted old shop avatar: ${existsUser.avatar.public_id}`);
        } catch (error) {
          console.error('Error deleting previous shop avatar from Cloudinary:', error.message);
          // Continue with the update even if old file deletion fails
        }
      }

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: avatarData,
      }, { new: true });

      res.status(200).json({
        success: true,
        seller,
        message: "Avatar updated successfully",
      });
    } catch (error) {
      // If there's an error and we have a new file, clean it up
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.log("Error cleaning up failed upload:", cleanupError.message);
        }
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode, latitude, longitude } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;
      
      // Update coordinates if provided
      if (latitude !== undefined) {
        shop.latitude = latitude;
      }
      if (longitude !== undefined) {
        shop.longitude = longitude;
      }

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin and SubAdmin with canViewAnalytics
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  requireAnyPermission(['canViewAnalytics']),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  requirePermission('canManageVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      // Delete all products associated with this shop
      const Product = require("../model/product");
      const Event = require("../model/event");
      const CoupounCode = require("../model/coupounCode");
      const VideoBanner = require("../model/videoBanner");
      
      // Delete only products CREATED BY this shop (not admin products assigned to shop)
      const deletedProducts = await Product.deleteMany({
        $and: [
          {
            $or: [
              { shopId: req.params.id },                    // String shop ID
              { sellerShop: req.params.id },                // ObjectId reference
              { shop: req.params.id },                      // If shop is stored as ObjectId
              { 'shop._id': req.params.id },               // If shop is embedded object with _id
              { 'shop.id': req.params.id },                // Alternative embedded reference
            ]
          },
          {
            $or: [
              { isSellerProduct: true },                    // Only delete seller-created products
              { isSellerProduct: { $exists: false } }      // Handle legacy products without this field
            ]
          }
        ]
      });
      console.log(`Deleted ${deletedProducts.deletedCount} products for shop ${req.params.id}`);

      // Delete all events for this shop  
      const deletedEvents = await Event.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedEvents.deletedCount} events for shop ${req.params.id}`);

      // Delete all coupon codes for this shop
      const deletedCoupons = await CoupounCode.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedCoupons.deletedCount} coupon codes for shop ${req.params.id}`);

      // Delete all video banners for this shop
      const deletedVideoBanners = await VideoBanner.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedVideoBanners.deletedCount} video banners for shop ${req.params.id}`);

      // Finally delete the shop itself
      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller and all associated data deleted successfully!",
        deletedData: {
          products: deletedProducts.deletedCount,
          events: deletedEvents.deletedCount,
          coupons: deletedCoupons.deletedCount,
          videoBanners: deletedVideoBanners.deletedCount
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod, paypalEmail } = req.body;

      const updateData = {};
      if (withdrawMethod) updateData.withdrawMethod = withdrawMethod;
      if (paypalEmail !== undefined) updateData.paypalEmail = paypalEmail;

      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(201).json({
        success: true,
        seller,
        message: "Payment methods updated successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop location --- sellers
router.put(
  "/update-shop-location",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { latitude, longitude, address } = req.body;

      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        {
          latitude,
          longitude,
          address,
        },
        { new: true }
      );

      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Shop location updated successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// forgot password --- sellers
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      // Check if this is a Supplier user first
      const User = require("../model/user");
      const supplierUser = await User.findOne({ email });
      
      let targetAccount = null;
      let accountType = null;

      if (supplierUser && supplierUser.role === 'Supplier') {
        // This is a Supplier user - reset their User account password
        targetAccount = supplierUser;
        accountType = 'supplier';
      } else {
        // Check for traditional shop account
        const shop = await Shop.findOne({ email });
        if (shop) {
          targetAccount = shop;
          accountType = 'shop';
        }
      }

      if (!targetAccount) {
        return next(new ErrorHandler("No account found with this email", 404));
      }

      // Generate reset password token
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Hash token and set to resetPasswordToken field
      targetAccount.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set expire time (2 hours)
      targetAccount.resetPasswordTime = Date.now() + 120 * 60 * 1000;

      await targetAccount.save();

      // Create reset password URL (pointing to frontend)
      // const resetPasswordUrl = `https://www.mallofcayman.com/shop-reset-password/${resetToken}`;
      const resetPasswordUrl = `${process.env.APP_URL}/shop-reset-password/${resetToken}`;

      const accountTypeText = accountType === 'supplier' ? 'Supplier account' : 'Shop account';

      try {
        // Fetch the email template from database
        let template = await EmailTemplate.findOne({ slug: 'password_reset' });
        
        let emailSubject, emailHtml;
        
        if (template) {
          // Use the template from database
          const variables = {
            userName: targetAccount.name,
            name: targetAccount.name,
            email: targetAccount.email,
            resetUrl: resetPasswordUrl
          };
          // render() returns { subject, html }
          const rendered = template.render(variables);
          emailSubject = `${accountTypeText} - ${rendered.subject}`;
          emailHtml = rendered.html;
        } else {
          // Fallback to default styled HTML if template not found
          emailSubject = `${accountTypeText} Password Recovery - Mall of Cayman`;
          emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🛍️ Mall of Cayman</h1>
                          <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Shop Smart, Shop Local</p>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${accountTypeText} Password Reset 🔐</h2>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hello ${targetAccount.name},
                          </p>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your ${accountTypeText.toLowerCase()} password. Click the button below to create a new password:
                          </p>
                          <!-- Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${resetPasswordUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                  🔑 Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                            Or copy and paste this link in your browser:<br>
                            <a href="${resetPasswordUrl}" style="color: #f97316; word-break: break-all;">${resetPasswordUrl}</a>
                          </p>
                          <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 14px;">
                            This link will expire in 2 hours.
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            If you didn't request a password reset, please ignore this email.
                          </p>
                          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} Mall of Cayman. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;
        }
        
        await sendMail({
          email: targetAccount.email,
          subject: emailSubject,
          message: `Your ${accountTypeText} password reset link: ${resetPasswordUrl}. If you have not requested this email, then ignore it.`,
          html: emailHtml,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${targetAccount.email} successfully`,
          accountType: accountType // Let frontend know which type of account
        });
      } catch (error) {
        targetAccount.resetPasswordToken = undefined;
        targetAccount.resetPasswordTime = undefined;
        await targetAccount.save();
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// reset password --- sellers
router.put(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Hash URL token
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      // First check in User model (for Supplier users)
      const User = require("../model/user");
      let targetAccount = await User.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now() },
      });
      
      let accountType = null;
      
      if (targetAccount) {
        accountType = 'supplier';
      } else {
        // If not found in User, check in Shop model
        targetAccount = await Shop.findOne({
          resetPasswordToken,
          resetPasswordTime: { $gt: Date.now() },
        });
        
        if (targetAccount) {
          accountType = 'shop';
        }
      }

      if (!targetAccount) {
        return next(
          new ErrorHandler(
            "Reset password token is invalid or has been expired",
            400
          )
        );
      }

      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400));
      }

      targetAccount.password = req.body.password;
      targetAccount.resetPasswordToken = undefined;
      targetAccount.resetPasswordTime = undefined;

      await targetAccount.save();

      // For supplier users, we need to return shop token using their shop profile
      if (accountType === 'supplier') {
        // Find or create shop profile for this supplier
        let shopProfile = await Shop.findOne({ email: targetAccount.email });
        
        if (!shopProfile) {
          shopProfile = await Shop.create({
            name: `${targetAccount.name}'s Shop`,
            email: targetAccount.email,
            password: 'temppassword123', // Won't be used for auth
            description: `Welcome to ${targetAccount.name}'s shop`,
            address: "Please update your address",
            phoneNumber: 1234567890,
            zipCode: 123456,
            avatar: {
              url: targetAccount.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
              public_id: targetAccount.avatar?.public_id || "avatar_gfxgav"
            }
          });
        }
        
        sendShopToken(shopProfile, 200, res);
      } else {
        sendShopToken(targetAccount, 200, res);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Ban a shop (Admin/Manager)
router.put(
  "/ban-shop",
  isAuthenticated,
  requirePermission('canManageVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, banReason } = req.body;

      if (!shopId || !banReason) {
        return next(new ErrorHandler("Shop ID and ban reason are required", 400));
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (shop.isBanned) {
        return next(new ErrorHandler("Shop is already banned", 400));
      }

      shop.isBanned = true;
      shop.banReason = banReason;
      shop.bannedBy = req.user._id;
      shop.bannedAt = new Date();

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Shop has been banned successfully",
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unban a shop (Admin/Manager)
router.put(
  "/unban-shop",
  isAuthenticated,
  requirePermission('canManageVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.body;

      if (!shopId) {
        return next(new ErrorHandler("Shop ID is required", 400));
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (!shop.isBanned) {
        return next(new ErrorHandler("Shop is not banned", 400));
      }

      shop.isBanned = false;
      shop.banReason = null;
      shop.bannedBy = null;
      shop.bannedAt = null;

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Shop has been unbanned successfully",
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Check shop ban status
router.get(
  "/ban-status",
  isAuthenticated,
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id).select('+isBanned +banReason +bannedAt +bannedBy');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        isBanned: shop.isBanned,
        banReason: shop.banReason,
        bannedAt: shop.bannedAt,
        bannedBy: shop.bannedBy,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shop password
router.put(
  "/update-password",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return next(new ErrorHandler("Current password and new password are required", 400));
      }

      if (newPassword.length < 6) {
        return next(new ErrorHandler("New password must be at least 6 characters long", 400));
      }

      // Get shop with password
      const shop = await Shop.findById(req.seller._id).select("+password");
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Check if current password is correct
      const isCurrentPasswordValid = await shop.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return next(new ErrorHandler("Current password is incorrect", 401));
      }

      // Update password
      shop.password = newPassword;
      await shop.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get pending sellers for admin approval
router.get(
  "/admin-pending-sellers",
  isAuthenticated,
  requirePermission('canApproveVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const pendingSellers = await Shop.find({ approvalStatus: 'pending' }).sort({
        createdAt: -1,
      });
      
      res.status(200).json({
        success: true,
        sellers: pendingSellers,
        count: pendingSellers.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Approve seller (Admin only)
router.put(
  "/admin-approve-seller/:id",
  isAuthenticated,
  requirePermission('canApproveVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;

      const seller = await Shop.findById(id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      if (seller.approvalStatus === 'approved') {
        return next(new ErrorHandler("Seller is already approved", 400));
      }

      seller.approvalStatus = 'approved';
      seller.approvedBy = req.user._id;
      seller.approvedAt = new Date();
      seller.rejectedBy = null;
      seller.rejectedAt = null;
      seller.rejectionReason = null;

      await seller.save();

      // Create notification for approval
      await NotificationService.createShopApprovalNotification(seller, "approved", req.user);

      // Send approval email to seller
      try {
        // Fetch the email template from database
        let template = await EmailTemplate.findOne({ slug: 'shop_approved' });
        
        let emailSubject, emailHtml;
        // const dashboardUrl = 'https://www.mallofcayman.com/dashboard';
        const dashboardUrl = `${process.env.APP_URL}/dashboard`;
        
        if (template) {
          // Use the template from database
          const variables = {
            shopName: seller.name,
            sellerName: seller.name,
            loginUrl: dashboardUrl
          };
          // render() returns { subject, html }
          const rendered = template.render(variables);
          emailSubject = rendered.subject;
          emailHtml = rendered.html;
        } else {
          // Fallback to default styled HTML
          emailSubject = "🎉 Shop Approved - Welcome to Mall of Cayman!";
          emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
                          <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your shop has been approved</p>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Welcome aboard, ${seller.name}! 🏪</h2>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Great news! Your shop application has been reviewed and approved by our admin team. You can now start selling on Mall of Cayman!
                          </p>
                          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534; font-weight: bold;">Shop Details:</p>
                            <p style="margin: 10px 0 0 0; color: #166534;">• Name: ${seller.name}</p>
                            <p style="margin: 5px 0 0 0; color: #166534;">• Email: ${seller.email}</p>
                            <p style="margin: 5px 0 0 0; color: #166534;">• Address: ${seller.address}</p>
                          </div>
                          <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Click the button below to access your seller dashboard and start uploading your products:
                          </p>
                          <!-- Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${dashboardUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                  🚀 Go to Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            Need help getting started? Contact our support team.
                          </p>
                          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} Mall of Cayman. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;
        }
        
        await sendMail({
          email: seller.email,
          subject: emailSubject,
          message: `Congratulations ${seller.name}! Your shop has been approved. You can now access your seller dashboard and start selling.`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError.message);
        // Continue with the approval even if email fails
      }

      res.status(200).json({
        success: true,
        message: "Seller approved successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reject seller (SubAdmin can reject)
router.put(
  "/admin-reject-seller/:id",
  isAuthenticated,
  requirePermission('canApproveVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return next(new ErrorHandler("Rejection reason is required", 400));
      }

      const seller = await Shop.findById(id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      if (seller.approvalStatus === 'rejected') {
        return next(new ErrorHandler("Seller is already rejected", 400));
      }

      seller.approvalStatus = 'rejected';
      seller.rejectedBy = req.user._id;
      seller.rejectedAt = new Date();
      seller.rejectionReason = rejectionReason;
      seller.approvedBy = null;
      seller.approvedAt = null;

      await seller.save();

      // Create notification for rejection
      await NotificationService.createShopApprovalNotification(seller, "rejected", req.user, rejectionReason);

      // Send rejection email to seller
      try {
        // Fetch the email template from database
        let template = await EmailTemplate.findOne({ slug: 'shop_rejected' });
        
        let emailSubject, emailHtml;
        
        if (template) {
          // Use the template from database
          const variables = {
            shopName: seller.name,
            sellerName: seller.name,
            rejectionReason: rejectionReason,
            supportEmail: 'support@mallofcayman.com'
          };
          // render() returns { subject, html }
          const rendered = template.render(variables);
          emailSubject = rendered.subject;
          emailHtml = rendered.html;
        } else {
          // Fallback to default styled HTML
          emailSubject = "Shop Application Status - Action Required";
          emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🛍️ Mall of Cayman</h1>
                          <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Shop Application Update</p>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Application Status Update</h2>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Hello ${seller.name},
                          </p>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We regret to inform you that your shop application has been reviewed and we cannot approve it at this time.
                          </p>
                          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #991b1b; font-weight: bold;">Reason for rejection:</p>
                            <p style="margin: 10px 0 0 0; color: #991b1b;">${rejectionReason}</p>
                          </div>
                          <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <p style="margin: 0; color: #6b7280; font-weight: bold;">Shop Details:</p>
                            <p style="margin: 10px 0 0 0; color: #6b7280;">• Name: ${seller.name}</p>
                            <p style="margin: 5px 0 0 0; color: #6b7280;">• Email: ${seller.email}</p>
                            <p style="margin: 5px 0 0 0; color: #6b7280;">• Address: ${seller.address}</p>
                          </div>
                          <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            If you believe this decision was made in error or if you have addressed the concerns mentioned, please feel free to contact our support team.
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            Thank you for your interest in Mall of Cayman.
                          </p>
                          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} Mall of Cayman. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;
        }
        
        await sendMail({
          email: seller.email,
          subject: emailSubject,
          message: `Hello ${seller.name}, your shop application has been rejected. Reason: ${rejectionReason}. Please contact support if you have questions.`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError.message);
        // Continue with the rejection even if email fails
      }

      res.status(200).json({
        success: true,
        message: "Seller rejected successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get seller statistics for admin dashboard
router.get(
  "/admin-seller-stats",
  isAuthenticated,
  requirePermission('canViewAnalytics'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalSellers = await Shop.countDocuments();
      const approvedSellers = await Shop.countDocuments({ approvalStatus: 'approved' });
      const pendingSellers = await Shop.countDocuments({ approvalStatus: 'pending' });
      const rejectedSellers = await Shop.countDocuments({ approvalStatus: 'rejected' });
      const bannedSellers = await Shop.countDocuments({ isBanned: true });

      const stats = {
        total: totalSellers,
        approved: approvedSellers,
        pending: pendingSellers,
        rejected: rejectedSellers,
        banned: bannedSellers,
        active: approvedSellers - bannedSellers, // Approved and not banned
      };

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all sellers with their approval status (Admin/Manager)
router.get(
  "/admin-all-sellers-with-status",
  isAuthenticated,
  requirePermission('canManageVendors'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query.approvalStatus = status;
      }

      const sellers = await Shop.find(query)
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .populate('bannedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalSellers = await Shop.countDocuments(query);

      res.status(200).json({
        success: true,
        sellers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSellers / limit),
          totalSellers,
          hasNext: page * limit < totalSellers,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get custom HTML/CSS for shop (Seller)
router.get(
  "/get-custom-html-css",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id).select('customHtml customCss customHtmlEnabled');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        customHtml: shop.customHtml || "",
        customCss: shop.customCss || "",
        customHtmlEnabled: shop.customHtmlEnabled || false,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update custom HTML/CSS for shop (Seller - requires htmlCssEditor feature)
router.put(
  "/update-custom-html-css",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { customHtml, customCss, customHtmlEnabled } = req.body;

      // Check if seller has htmlCssEditor feature in their subscription
      const Subscription = require("../model/subscription");
      const subscription = await Subscription.findOne({
        shop: req.seller._id,
        status: { $in: ['active', 'pending'] },
      });

      if (!subscription || !subscription.features?.htmlCssEditor) {
        return next(new ErrorHandler("HTML/CSS Editor feature is not available in your subscription plan. Please upgrade to Gold plan.", 403));
      }

      // Validate HTML/CSS length
      if (customHtml && customHtml.length > 50000) {
        return next(new ErrorHandler("Custom HTML cannot exceed 50000 characters", 400));
      }

      if (customCss && customCss.length > 20000) {
        return next(new ErrorHandler("Custom CSS cannot exceed 20000 characters", 400));
      }

      // Basic sanitization - remove script tags and event handlers
      let sanitizedHtml = customHtml || "";
      // Remove script tags
      sanitizedHtml = sanitizedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Remove onclick, onload, onerror, etc. event handlers
      sanitizedHtml = sanitizedHtml.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
      // Remove javascript: URLs
      sanitizedHtml = sanitizedHtml.replace(/javascript\s*:/gi, '');

      const shop = await Shop.findByIdAndUpdate(
        req.seller._id,
        {
          customHtml: sanitizedHtml,
          customCss: customCss || "",
          customHtmlEnabled: customHtmlEnabled ?? false,
        },
        { new: true }
      ).select('customHtml customCss customHtmlEnabled');

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Custom HTML/CSS updated successfully",
        customHtml: shop.customHtml,
        customCss: shop.customCss,
        customHtmlEnabled: shop.customHtmlEnabled,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get custom HTML/CSS for public shop page
router.get(
  "/get-shop-custom-html/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.shopId).select('customHtml customCss customHtmlEnabled');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Only return custom content if enabled
      if (!shop.customHtmlEnabled) {
        return res.status(200).json({
          success: true,
          customHtml: "",
          customCss: "",
          customHtmlEnabled: false,
        });
      }

      res.status(200).json({
        success: true,
        customHtml: shop.customHtml || "",
        customCss: shop.customCss || "",
        customHtmlEnabled: shop.customHtmlEnabled,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get Gold subscription sellers for Mall Map (public)
router.get(
  "/gold-sellers",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const Subscription = require("../model/subscription");
      
      // Find all active gold subscriptions
      const activeGoldSubscriptions = await Subscription.find({
        plan: 'gold',
        status: 'active',
        endDate: { $gt: new Date() }
      }).select('shop');

      // Get the shop IDs
      const goldShopIds = activeGoldSubscriptions.map(sub => sub.shop);

      // Find shops with active gold subscriptions
      const goldSellers = await Shop.find({
        _id: { $in: goldShopIds },
        approvalStatus: 'approved',
        isBanned: false,
      })
        .select('name avatar address description _id')
        .sort({ createdAt: -1 })
        .limit(20); // Limit to 20 for the map

      res.status(200).json({
        success: true,
        sellers: goldSellers,
        count: goldSellers.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get store settings
router.get(
  "/get-store-settings",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id).select('storeSettings paypalEmail bankAccountDetails');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        storeSettings: shop.storeSettings || {},
        paypalEmail: shop.paypalEmail || "",
        bankAccountDetails: shop.bankAccountDetails || {}
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update store settings
router.put(
  "/update-store-settings",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { storeSettings, paypalEmail, bankAccountDetails } = req.body;

      const shop = await Shop.findById(req.seller._id);
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Update store settings
      if (storeSettings) {
        shop.storeSettings = {
          ...shop.storeSettings,
          ...storeSettings
        };
      }

      // Update PayPal email if provided
      if (paypalEmail !== undefined) {
        shop.paypalEmail = paypalEmail;
      }

      // Update bank account details if provided
      if (bankAccountDetails) {
        shop.bankAccountDetails = {
          ...shop.bankAccountDetails,
          ...bankAccountDetails
        };
      }

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Store settings updated successfully",
        storeSettings: shop.storeSettings,
        paypalEmail: shop.paypalEmail,
        bankAccountDetails: shop.bankAccountDetails
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Toggle Ad Fee Exemption for a shop (for in-house stores or special partners)
router.put(
  "/admin/toggle-ad-fee-exempt/:shopId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { adFeeExempt, adFeeExemptReason, isInHouseStore, inHouseStoreNote } = req.body;

      const shop = await Shop.findById(shopId);
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Update ad fee exemption status
      shop.adFeeExempt = adFeeExempt !== undefined ? adFeeExempt : shop.adFeeExempt;
      shop.adFeeExemptReason = adFeeExemptReason !== undefined ? adFeeExemptReason : shop.adFeeExemptReason;
      
      // Update in-house store status
      shop.isInHouseStore = isInHouseStore !== undefined ? isInHouseStore : shop.isInHouseStore;
      shop.inHouseStoreNote = inHouseStoreNote !== undefined ? inHouseStoreNote : shop.inHouseStoreNote;
      
      // Track who made the change
      if (adFeeExempt) {
        shop.adFeeExemptBy = req.user._id;
        shop.adFeeExemptAt = new Date();
      } else {
        shop.adFeeExemptBy = null;
        shop.adFeeExemptAt = null;
      }

      await shop.save();

      res.status(200).json({
        success: true,
        message: adFeeExempt 
          ? `Ad fee exemption enabled for ${shop.name}` 
          : `Ad fee exemption disabled for ${shop.name}`,
        shop: {
          _id: shop._id,
          name: shop.name,
          adFeeExempt: shop.adFeeExempt,
          adFeeExemptReason: shop.adFeeExemptReason,
          isInHouseStore: shop.isInHouseStore,
          inHouseStoreNote: shop.inHouseStoreNote,
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get all ad-fee-exempt shops
router.get(
  "/admin/ad-fee-exempt-shops",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shops = await Shop.find({ adFeeExempt: true })
        .select('name email avatar isInHouseStore inHouseStoreNote adFeeExempt adFeeExemptReason adFeeExemptAt createdAt')
        .populate('adFeeExemptBy', 'name email')
        .sort({ adFeeExemptAt: -1 });

      res.status(200).json({
        success: true,
        count: shops.length,
        shops
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get shop ad fee exemption status
router.get(
  "/admin/shop-ad-status/:shopId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;

      const shop = await Shop.findById(shopId)
        .select('name email avatar isInHouseStore inHouseStoreNote adFeeExempt adFeeExemptReason adFeeExemptAt')
        .populate('adFeeExemptBy', 'name email');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        shop
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
