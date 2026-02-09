const express = require("express");
const router = express.Router();
const StoreManagerService = require("../model/storeManager");
const Shop = require("../model/shop");
const User = require("../model/user");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const axios = require("axios");
const sendMail = require("../utils/sendMail");

// Helper function to generate styled email HTML
const generateStyledEmail = (title, subtitle, content, buttonText, buttonUrl, footerText) => {
  return `
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
                  <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">${title}</h2>
                  ${subtitle ? `<p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">${subtitle}</p>` : ''}
                  ${content}
                  ${buttonText && buttonUrl ? `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${buttonUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                          ${buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    ${footerText || 'Thank you for choosing Mall of Cayman!'}
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
};

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "EH0vP4NgiaX9xhw8LDoZJaPkh6sw1lostSYjeQJQxjegPWyHlCYLQxlONQ11B03W3SrxzvKB6pD-gsdI";
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api-m.paypal.com";

// Store Manager Service Price (USD)
const STORE_MANAGER_PRICE = 100;

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error.response?.data || error.message);
    throw new Error('Failed to get PayPal access token');
  }
};

// ==================== SELLER ROUTES ====================

// Get store manager service status for current shop
router.get(
  "/my-service",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      
      let service = await StoreManagerService.findOne({ shop: shopId })
        .populate('assignedManager', 'name email avatar phoneNumber');
      
      if (!service) {
        // Return default inactive state
        return res.status(200).json({
          success: true,
          service: {
            serviceStatus: 'inactive',
            assignedManager: null,
            price: STORE_MANAGER_PRICE,
          },
          hasService: false,
          isExpired: false,
          daysRemaining: 0,
        });
      }

      // Check and update if subscription has expired
      const isExpired = service.subscriptionEndDate && new Date() > new Date(service.subscriptionEndDate);
      if (isExpired && service.serviceStatus === 'active') {
        service.serviceStatus = 'expired';
        await service.save();
      }

      // Calculate days remaining
      const daysRemaining = service.getDaysRemaining();
      const isActive = service.serviceStatus === 'active' && !isExpired;

      res.status(200).json({
        success: true,
        service,
        hasService: isActive,
        isExpired: service.serviceStatus === 'expired' || isExpired,
        daysRemaining,
        canRenew: service.serviceStatus === 'expired' || (isActive && daysRemaining <= 7),
        price: STORE_MANAGER_PRICE,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create PayPal order for Store Manager service purchase
router.post(
  "/create-purchase",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.seller._id;
      const { isRenewal } = req.body;
      
      // Check if service already active and not expired (for new purchases only)
      const existingService = await StoreManagerService.findOne({
        shop: shopId,
      });

      if (existingService && existingService.serviceStatus === 'active' && !isRenewal) {
        // Check if subscription is still valid
        if (existingService.subscriptionEndDate && new Date() < new Date(existingService.subscriptionEndDate)) {
          const daysRemaining = existingService.getDaysRemaining();
          if (daysRemaining > 7) {
            return next(new ErrorHandler('Store Manager service is still active. You can renew within 7 days of expiry.', 400));
          }
        }
      }

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Create PayPal order
      const orderDescription = isRenewal 
        ? 'Mall of Cayman - Store Manager Service Renewal (1 Month)'
        : 'Mall of Cayman - Store Manager Service (1 Month)';

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: STORE_MANAGER_PRICE.toFixed(2),
          },
          description: orderDescription,
          custom_id: `store_manager_${shopId}_${isRenewal ? 'renewal' : 'new'}`,
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/dashboard-store-manager?status=success`,
          cancel_url: `${process.env.FRONTEND_URL}/dashboard-store-manager?status=cancelled`,
          brand_name: 'Mall of Cayman',
          user_action: 'PAY_NOW',
        },
      };

      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Create or update pending service record
      let service = await StoreManagerService.findOne({ shop: shopId });
      if (!service) {
        service = await StoreManagerService.create({
          shop: shopId,
          serviceStatus: 'inactive',
          purchaseInfo: {
            paypalOrderId: response.data.id,
          },
        });
      } else {
        service.purchaseInfo.paypalOrderId = response.data.id;
        await service.save();
      }

      res.status(200).json({
        success: true,
        orderId: response.data.id,
        approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
        serviceId: service._id,
        isRenewal: !!isRenewal,
      });
    } catch (error) {
      console.error('PayPal order creation error:', error.response?.data || error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Capture PayPal payment and activate Store Manager service
router.post(
  "/activate-service",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, isRenewal } = req.body;
      const shopId = req.seller._id;

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Capture the payment
      const captureResponse = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (captureResponse.data.status !== 'COMPLETED') {
        return next(new ErrorHandler('Payment not completed', 400));
      }

      // Get transaction details
      const capture = captureResponse.data.purchase_units[0]?.payments?.captures?.[0];
      const transactionId = capture?.id;

      // Update or create service record
      let service = await StoreManagerService.findOne({ shop: shopId });
      if (!service) {
        service = await StoreManagerService.create({ shop: shopId });
      }

      // Calculate subscription dates
      const now = new Date();
      let startDate = now;
      let endDate = new Date(now);
      
      // If renewing and current subscription hasn't expired yet, extend from current end date
      if (isRenewal && service.subscriptionEndDate && new Date(service.subscriptionEndDate) > now) {
        startDate = new Date(service.subscriptionEndDate);
        endDate = new Date(service.subscriptionEndDate);
      }
      
      // Add 1 month to end date
      endDate.setMonth(endDate.getMonth() + 1);

      service.serviceStatus = 'active';
      service.subscriptionStartDate = startDate;
      service.subscriptionEndDate = endDate;
      service.purchaseInfo = {
        purchaseDate: now,
        amount: STORE_MANAGER_PRICE,
        currency: 'USD',
        paymentMethod: 'paypal',
        paypalOrderId: orderId,
        transactionId: transactionId,
      };
      
      // Add to payment history
      service.paymentHistory.push({
        amount: STORE_MANAGER_PRICE,
        date: now,
        transactionId: transactionId,
        paymentMethod: 'paypal',
        periodStart: startDate,
        periodEnd: endDate,
        status: 'success',
      });
      
      await service.save();

      // Update shop
      const shop = await Shop.findById(shopId);
      shop.storeManagerService = service._id;
      shop.storeManagerEnabled = true;
      await shop.save();

      // Send confirmation email
      try {
        const emailSubject = isRenewal 
          ? 'Store Manager Service Renewed - Mall of Cayman'
          : 'Store Manager Service Activated - Mall of Cayman';
        
        const content = `
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${shop.name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your Store Manager service has been successfully <strong>${isRenewal ? 'renewed' : 'activated'}</strong>! 🎉
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">📅 Subscription Period:</p>
            <p style="margin: 10px 0 0 0; color: #166534;">${startDate.toDateString()} - ${endDate.toDateString()}</p>
          </div>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">✅ What your Store Manager can do:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Add and edit products</li>
              <li>Manage inventory/stock levels</li>
              <li>View and manage order fulfillment</li>
            </ul>
          </div>
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">❌ What they CANNOT do:</p>
            <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
              <li>Access payment settings</li>
              <li>Edit store information</li>
              <li>Issue refunds</li>
              <li>Change account settings</li>
            </ul>
          </div>
          <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
            Your subscription will expire on <strong>${endDate.toDateString()}</strong>. You can renew anytime within the last 7 days before expiry.
          </p>
        `;
        
        const emailHtml = generateStyledEmail(
          isRenewal ? 'Service Renewed! 🔄' : 'Service Activated! 🎉',
          'Store Manager Service',
          content,
          '🏪 Go to Dashboard',
          `${process.env.FRONTEND_URL}/dashboard`,
          'Thank you for choosing Mall of Cayman!'
        );
        
        await sendMail({
          email: shop.email,
          subject: emailSubject,
          message: `Your Store Manager service has been ${isRenewal ? 'renewed' : 'activated'}. Subscription: ${startDate.toDateString()} - ${endDate.toDateString()}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: `Store Manager service ${isRenewal ? 'renewed' : 'activated'} successfully`,
        service,
        subscriptionEndDate: endDate,
      });
    } catch (error) {
      console.error('Service activation error:', error.response?.data || error.message);
      
      // Parse PayPal specific errors for better user messages
      const paypalError = error.response?.data;
      let userMessage = 'Failed to activate Store Manager service. Please try again.';
      let errorCode = 'PAYMENT_FAILED';
      
      if (paypalError) {
        // Handle PayPal error details
        const details = paypalError.details?.[0];
        const issue = details?.issue || paypalError.name;
        
        switch (issue) {
          case 'INSTRUMENT_DECLINED':
            userMessage = 'Your payment method was declined. Please try a different card or payment method.';
            errorCode = 'PAYMENT_DECLINED';
            break;
          case 'INSUFFICIENT_FUNDS':
            userMessage = 'Insufficient funds in your account. Please add funds or use a different payment method.';
            errorCode = 'INSUFFICIENT_FUNDS';
            break;
          case 'CARD_EXPIRED':
            userMessage = 'Your card has expired. Please use a different payment method.';
            errorCode = 'CARD_EXPIRED';
            break;
          case 'INVALID_CURRENCY_CODE':
            userMessage = 'The currency is not supported. Please contact support.';
            errorCode = 'INVALID_CURRENCY';
            break;
          case 'PAYER_ACTION_REQUIRED':
            userMessage = 'Additional verification is required. Please complete the payment on PayPal.';
            errorCode = 'ACTION_REQUIRED';
            break;
          case 'ORDER_NOT_APPROVED':
            userMessage = 'Payment was not approved. Please try again and complete the payment on PayPal.';
            errorCode = 'NOT_APPROVED';
            break;
          case 'ORDER_ALREADY_CAPTURED':
            userMessage = 'This payment has already been processed.';
            errorCode = 'ALREADY_CAPTURED';
            break;
          case 'DUPLICATE_INVOICE_ID':
            userMessage = 'This transaction has already been processed.';
            errorCode = 'DUPLICATE';
            break;
          case 'PERMISSION_DENIED':
          case 'AUTHORIZATION_ERROR':
            userMessage = 'Payment authorization failed. Please try again.';
            errorCode = 'AUTH_ERROR';
            break;
          default:
            // Use PayPal's message if available
            if (details?.description) {
              userMessage = details.description;
            } else if (paypalError.message) {
              userMessage = paypalError.message;
            }
        }
      }
      
      return res.status(422).json({
        success: false,
        message: userMessage,
        errorCode: errorCode,
        details: process.env.NODE_ENV === 'development' ? paypalError : undefined
      });
    }
  })
);

// Search for users to assign as Store Manager
router.get(
  "/search-users",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.query;

      if (!email || email.length < 3) {
        return res.status(200).json({
          success: true,
          users: [],
        });
      }

      // Search for users by email (excluding only Admins/SubAdmins)
      // Allow User, store_manager, Supplier, Manager roles to be assigned as store managers
      const users = await User.find({
        email: { $regex: email, $options: 'i' },
        role: { $nin: ['Admin', 'SubAdmin'] }, // Exclude only admin roles
      })
        .select('_id name email avatar phoneNumber role')
        .limit(10);

      console.log(`Search for "${email}" found ${users.length} users:`, users.map(u => ({ email: u.email, role: u.role })));

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create a new Store Manager account
router.post(
  "/create-manager-account",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, phoneNumber } = req.body;
      const shopId = req.seller._id;

      // Validate required fields
      if (!name || !email || !password) {
        return next(new ErrorHandler('Name, email, and password are required', 400));
      }

      // Validate password length
      if (password.length < 6) {
        return next(new ErrorHandler('Password must be at least 6 characters', 400));
      }

      // Check if service is active
      const service = await StoreManagerService.findOne({ shop: shopId });
      if (!service || service.serviceStatus !== 'active') {
        return next(new ErrorHandler('Store Manager service not active. Please purchase the service first.', 400));
      }

      if (service.suspendedByAdmin) {
        return next(new ErrorHandler('Store Manager service is suspended', 400));
      }

      // Check if already has a manager assigned
      if (service.assignedManager) {
        return next(new ErrorHandler('You already have a Store Manager assigned. Remove the current manager first to create a new one.', 400));
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return next(new ErrorHandler('An account with this email already exists. Please search for existing users instead.', 400));
      }

      // Get shop details
      const shop = await Shop.findById(shopId);

      // Create new user account with store_manager role
      const newManager = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phoneNumber: phoneNumber || undefined,
        role: 'store_manager',
        managedShop: shopId,
      });

      // Record in history
      if (service.assignedManager) {
        service.managerHistory.push({
          user: service.assignedManager,
          action: 'removed',
          actionDate: new Date(),
          actionBy: shopId,
          reason: 'Replaced with new manager account',
        });
      }

      // Assign the new manager
      service.assignedManager = newManager._id;
      service.managerAssignment = {
        assignedAt: new Date(),
        assignedBy: shopId,
      };
      service.managerHistory.push({
        user: newManager._id,
        action: 'assigned',
        actionDate: new Date(),
        actionBy: shopId,
        notes: 'Account created by store owner',
      });
      await service.save();

      // Send welcome email to new manager with credentials
      try {
        const managerContent = `
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${newManager.name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            An account has been created for you as a <strong>Store Manager</strong> for "<strong>${shop.name}</strong>" on Mall of Cayman! 🎉
          </p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold;">🔐 Your Login Credentials:</p>
            <p style="margin: 5px 0; color: #92400e;"><strong>Email:</strong> ${newManager.email}</p>
            <p style="margin: 5px 0; color: #92400e;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 10px 0 0 0; color: #dc2626; font-size: 12px; font-weight: bold;">⚠️ Please change your password after your first login!</p>
          </div>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">📋 Your Responsibilities:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Managing products (add, edit, update)</li>
              <li>Managing inventory/stock levels</li>
              <li>Processing and fulfilling orders</li>
            </ul>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-weight: bold;">📝 Important Notes:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li>You will receive order notifications</li>
              <li>Payment goes directly to the store owner</li>
              <li>Coordinate with the store owner for delivery</li>
            </ul>
          </div>
        `;
        
        const managerEmailHtml = generateStyledEmail(
          'Welcome, Store Manager! 👋',
          `You've been assigned to manage ${shop.name}`,
          managerContent,
          '🚀 Login Now',
          `${process.env.FRONTEND_URL}/login`,
          'Thank you for joining Mall of Cayman!'
        );
        
        await sendMail({
          email: newManager.email,
          subject: 'Your Store Manager Account - Mall of Cayman',
          message: `Hello ${newManager.name}, you've been assigned as Store Manager for ${shop.name}. Email: ${newManager.email}, Password: ${password}. Please change your password after first login.`,
          html: managerEmailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send manager welcome email:', emailError);
      }

      // Notify shop owner
      try {
        const ownerContent = `
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${shop.name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            You have successfully created a Store Manager account! 🎉
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;">👤 Manager Details:</p>
            <p style="margin: 5px 0; color: #166534;"><strong>Name:</strong> ${newManager.name}</p>
            <p style="margin: 5px 0; color: #166534;"><strong>Email:</strong> ${newManager.email}</p>
          </div>
          <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your Store Manager can now log in and help manage your store's day-to-day operations.
          </p>
        `;
        
        const ownerEmailHtml = generateStyledEmail(
          'Store Manager Assigned! ✅',
          'Your store manager account is ready',
          ownerContent,
          '🏪 Go to Dashboard',
          `${process.env.FRONTEND_URL}/dashboard`,
          'Thank you for choosing Mall of Cayman!'
        );
        
        await sendMail({
          email: shop.email,
          subject: 'Store Manager Account Created - Mall of Cayman',
          message: `Hello ${shop.name}, you have created a Store Manager account. Manager: ${newManager.name} (${newManager.email}). They can now log in and help manage your store.`,
          html: ownerEmailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send owner notification:', emailError);
      }

      const populatedService = await StoreManagerService.findById(service._id)
        .populate('assignedManager', 'name email avatar phoneNumber');

      res.status(201).json({
        success: true,
        message: 'Store Manager account created and assigned successfully',
        service: populatedService,
        manager: {
          _id: newManager._id,
          name: newManager.name,
          email: newManager.email,
          phoneNumber: newManager.phoneNumber,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Assign a Store Manager
router.post(
  "/assign-manager",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.body;
      const shopId = req.seller._id;

      // Get service
      const service = await StoreManagerService.findOne({ shop: shopId });
      if (!service || service.serviceStatus !== 'active') {
        return next(new ErrorHandler('Store Manager service not active', 400));
      }

      if (service.suspendedByAdmin) {
        return next(new ErrorHandler('Store Manager service is suspended', 400));
      }

      // Verify user exists and is a regular user
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      // Allow both 'User' role and 'store_manager' role (for reassigning)
      if (!['User', 'store_manager'].includes(user.role)) {
        return next(new ErrorHandler('Only regular users can be assigned as Store Manager', 400));
      }

      // Check if user is already a store manager for another shop
      const existingAssignment = await StoreManagerService.findOne({
        assignedManager: userId,
        serviceStatus: 'active',
        shop: { $ne: shopId },
      });

      if (existingAssignment) {
        return next(new ErrorHandler('This user is already a Store Manager for another shop', 400));
      }

      // Record previous manager if exists
      if (service.assignedManager) {
        service.managerHistory.push({
          user: service.assignedManager,
          action: 'removed',
          actionDate: new Date(),
          actionBy: shopId,
          reason: 'Replaced with new manager',
        });
      }

      // Assign new manager
      service.assignedManager = userId;
      service.managerAssignment = {
        assignedAt: new Date(),
        assignedBy: shopId,
      };
      service.managerHistory.push({
        user: userId,
        action: 'assigned',
        actionDate: new Date(),
        actionBy: shopId,
      });
      await service.save();

      // Update user role to store_manager
      user.role = 'store_manager';
      user.managedShop = shopId;
      await user.save();

      // Get shop details
      const shop = await Shop.findById(shopId);

      // Send email to new manager
      try {
        const assignContent = `
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${user.name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Great news! 🎉 You have been assigned as the <strong>Store Manager</strong> for "<strong>${shop.name}</strong>" on Mall of Cayman.
          </p>
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">📋 Your Responsibilities:</p>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Managing products (add, edit, update)</li>
              <li>Managing inventory/stock levels</li>
              <li>Processing and fulfilling orders</li>
            </ul>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-weight: bold;">📝 Important Notes:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li>You will receive order notifications</li>
              <li>Payment goes directly to the store owner</li>
              <li>Coordinate with the store owner for delivery</li>
            </ul>
          </div>
        `;
        
        const assignEmailHtml = generateStyledEmail(
          'You\'ve Been Assigned! 🎉',
          `Store Manager for ${shop.name}`,
          assignContent,
          '🚀 Go to Dashboard',
          `${process.env.FRONTEND_URL}/dashboard`,
          'Thank you for joining Mall of Cayman!'
        );
        
        await sendMail({
          email: user.email,
          subject: 'You have been assigned as Store Manager - Mall of Cayman',
          message: `Hello ${user.name}, you have been assigned as Store Manager for ${shop.name}. Log in to access your dashboard.`,
          html: assignEmailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send manager notification email:', emailError);
      }

      const populatedService = await StoreManagerService.findById(service._id)
        .populate('assignedManager', 'name email avatar phoneNumber');

      res.status(200).json({
        success: true,
        message: 'Store Manager assigned successfully',
        service: populatedService,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Remove Store Manager
router.post(
  "/remove-manager",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reason } = req.body;
      const shopId = req.seller._id;

      // Get service
      const service = await StoreManagerService.findOne({ shop: shopId })
        .populate('assignedManager', 'name email');

      if (!service || !service.assignedManager) {
        return next(new ErrorHandler('No Store Manager assigned', 400));
      }

      const removedManager = service.assignedManager;

      // Add to history
      service.managerHistory.push({
        user: service.assignedManager._id,
        action: 'removed',
        actionDate: new Date(),
        actionBy: shopId,
        reason: reason || 'Removed by store owner',
      });

      service.assignedManager = null;
      service.managerAssignment = {};
      await service.save();

      // Update user role back to regular user
      const user = await User.findById(removedManager._id);
      if (user) {
        user.role = 'User'; // Use capitalized 'User' to match enum
        user.managedShop = null;
        await user.save();
      }

      // Send notification email to removed manager
      try {
        const removeContent = `
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${removedManager.name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your Store Manager access has been removed by the store owner.
          </p>
          ${reason ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">📝 Reason:</p>
            <p style="margin: 10px 0 0 0; color: #991b1b;">${reason}</p>
          </div>
          ` : ''}
          <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            You no longer have access to the store management dashboard. If you have any questions, please contact the store owner directly.
          </p>
        `;
        
        const removeEmailHtml = generateStyledEmail(
          'Access Removed',
          'Store Manager Access Update',
          removeContent,
          null,
          null,
          'Thank you for your service on Mall of Cayman.'
        );
        
        await sendMail({
          email: removedManager.email,
          subject: 'Store Manager Access Removed - Mall of Cayman',
          message: `Hello ${removedManager.name}, your Store Manager access has been removed. ${reason ? `Reason: ${reason}` : ''} You no longer have access to the store management dashboard.`,
          html: removeEmailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send removal notification:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Store Manager removed successfully',
        service,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==================== STORE MANAGER ROUTES ====================

// Get managed shop info (for store managers)
router.get(
  "/my-managed-shop",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;

      // Find shop where this user is assigned as manager
      const service = await StoreManagerService.findOne({
        assignedManager: userId,
        serviceStatus: 'active',
        suspendedByAdmin: false,
      }).populate({
        path: 'shop',
        select: 'name email avatar address phoneNumber isInHouseStore inHouseStoreNote adFeeExempt adFeeExemptReason',
      });

      if (!service) {
        return res.status(200).json({
          success: true,
          isStoreManager: false,
          shop: null,
        });
      }

      res.status(200).json({
        success: true,
        isStoreManager: true,
        shop: service.shop,
        service: {
          assignedAt: service.managerAssignment.assignedAt,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==================== ADMIN ROUTES ====================

// Get all store manager services (admin)
router.get(
  "/admin/all-services",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Only get services that have been activated (purchased)
      // Exclude 'inactive' status which means not yet purchased
      const services = await StoreManagerService.find({
        serviceStatus: { $ne: 'inactive' }
      })
        .populate('shop', 'name email avatar')
        .populate('assignedManager', 'name email avatar')
        .sort({ createdAt: -1 });

      const stats = {
        total: services.length,
        active: services.filter(s => s.serviceStatus === 'active').length,
        withManager: services.filter(s => s.assignedManager).length,
        suspended: services.filter(s => s.suspendedByAdmin).length,
        totalRevenue: services
          .filter(s => s.serviceStatus === 'active')
          .reduce((sum, s) => sum + (s.purchaseInfo?.amount || 0), 0),
      };

      res.status(200).json({
        success: true,
        services,
        stats,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Suspend/unsuspend store manager service (admin)
router.put(
  "/admin/toggle-suspension/:serviceId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { serviceId } = req.params;
      const { suspend, reason } = req.body;

      const service = await StoreManagerService.findById(serviceId)
        .populate('shop', 'name email')
        .populate('assignedManager', 'name email');

      if (!service) {
        return next(new ErrorHandler('Service not found', 404));
      }

      if (suspend) {
        service.serviceStatus = 'suspended'; // Update the status
        service.suspendedByAdmin = true;
        service.suspensionReason = reason || 'Suspended by admin';
        service.suspendedAt = new Date();
        service.suspendedBy = req.user._id;

        // If manager is assigned, revert their role
        if (service.assignedManager) {
          const user = await User.findById(service.assignedManager._id);
          if (user) {
            user.role = 'User'; // Use capitalized 'User' to match enum
            user.managedShop = null;
            await user.save();
          }

          service.managerHistory.push({
            user: service.assignedManager._id,
            action: 'suspended',
            actionDate: new Date(),
            actionBy: req.user._id,
            reason: reason || 'Admin suspension',
          });
        }
      } else {
        service.serviceStatus = 'active'; // Restore the status
        service.suspendedByAdmin = false;
        service.suspensionReason = null;
        service.suspendedAt = null;
        service.suspendedBy = null;

        // Restore manager role if still assigned
        if (service.assignedManager) {
          const user = await User.findById(service.assignedManager._id);
          if (user) {
            user.role = 'store_manager';
            user.managedShop = service.shop._id;
            await user.save();
          }
        }
      }

      await service.save();

      // Send notification email
      if (service.shop?.email) {
        try {
          const suspendContent = suspend ? `
            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Hello <strong>${service.shop.name}</strong>,
            </p>
            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your Store Manager service has been <strong>suspended</strong> by the admin.
            </p>
            ${reason ? `
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">📝 Reason:</p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">${reason}</p>
            </div>
            ` : ''}
            <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Please contact Mall of Cayman support if you believe this is an error.
            </p>
          ` : `
            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Hello <strong>${service.shop.name}</strong>,
            </p>
            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! 🎉 Your Store Manager service has been <strong>restored</strong> by the admin.
            </p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;">✅ Your Store Manager can now resume managing your store.</p>
            </div>
          `;
          
          const suspendEmailHtml = generateStyledEmail(
            suspend ? 'Service Suspended ⚠️' : 'Service Restored ✅',
            'Store Manager Service Update',
            suspendContent,
            null,
            null,
            'Mall of Cayman Admin Team'
          );
          
          await sendMail({
            email: service.shop.email,
            subject: `Store Manager Service ${suspend ? 'Suspended' : 'Restored'} - Mall of Cayman`,
            message: `Hello ${service.shop.name}, your Store Manager service has been ${suspend ? 'suspended' : 'restored'} by the admin. ${suspend && reason ? `Reason: ${reason}` : ''}`,
            html: suspendEmailHtml,
          });
        } catch (emailError) {
          console.error('Failed to send suspension notification:', emailError);
        }
      }

      res.status(200).json({
        success: true,
        message: `Service ${suspend ? 'suspended' : 'restored'} successfully`,
        service,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Assign free Store Manager service to a shop
router.post(
  "/admin/assign-free-service",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, reason, durationMonths = 1 } = req.body;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler('Shop not found', 404));
      }

      // Check if service already exists and is active
      let service = await StoreManagerService.findOne({ shop: shopId });
      if (service && service.serviceStatus === 'active') {
        // Check if not expired
        if (service.subscriptionEndDate && new Date() < new Date(service.subscriptionEndDate)) {
          return next(new ErrorHandler('Shop already has an active Store Manager service', 400));
        }
      }

      if (!service) {
        service = new StoreManagerService({ shop: shopId });
      }

      // Calculate subscription dates
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      service.serviceStatus = 'active';
      service.subscriptionStartDate = now;
      service.subscriptionEndDate = endDate;
      service.purchaseInfo = {
        purchaseDate: now,
        amount: 0,
        currency: 'USD',
        paymentMethod: 'admin_assigned',
        transactionId: `ADMIN_FREE_${Date.now()}`,
      };
      
      // Add to payment history
      service.paymentHistory.push({
        amount: 0,
        date: now,
        transactionId: `ADMIN_FREE_${Date.now()}`,
        paymentMethod: 'admin_assigned',
        periodStart: now,
        periodEnd: endDate,
        status: 'success',
      });
      
      await service.save();

      // Update shop
      shop.storeManagerService = service._id;
      shop.storeManagerEnabled = true;
      await shop.save();

      res.status(200).json({
        success: true,
        message: `Free Store Manager service assigned for ${durationMonths} month(s)`,
        service,
        subscriptionEndDate: endDate,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
