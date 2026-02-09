const express = require("express");
const router = express.Router();
const EmailTemplate = require("../model/emailTemplate");
const { isAuthenticated, requirePermission } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Default email templates
const defaultTemplates = [
  {
    name: "Seller Activation",
    slug: "seller_activation",
    description: "Email sent to sellers when they register to activate their account",
    subject: "Activate Your Shop - {{shopName}}",
    availableVariables: [
      { variable: "{{shopName}}", description: "Name of the shop", required: true },
      { variable: "{{sellerName}}", description: "Name of the seller", required: false },
      { variable: "{{activationUrl}}", description: "URL to activate the shop (DO NOT REMOVE)", required: true },
      { variable: "{{email}}", description: "Seller's email address", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🏪 Mall of Cayman</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Marketplace Partner</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Welcome, {{shopName}}! 🎉</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for registering your shop with Mall of Cayman! We're excited to have you join our growing marketplace.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                To complete your registration and activate your seller account, please click the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{activationUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{primaryColor}}, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                      ✨ Activate My Shop
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link in your browser:<br>
                <a href="{{activationUrl}}" style="color: {{primaryColor}}; word-break: break-all;">{{activationUrl}}</a>
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid {{primaryColor}}; padding: 15px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>⏰ Important:</strong> This activation link will expire in 24 hours. After activation, your shop will be reviewed by our admin team.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                If you didn't create this account, please ignore this email.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "User Activation",
    slug: "user_activation",
    description: "Email sent to users when they register to activate their account",
    subject: "Activate Your Account - Mall of Cayman",
    availableVariables: [
      { variable: "{{userName}}", description: "Name of the user", required: true },
      { variable: "{{activationUrl}}", description: "URL to activate the account (DO NOT REMOVE)", required: true },
      { variable: "{{email}}", description: "User's email address", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛍️ Mall of Cayman</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Shop Smart, Shop Local</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Hello, {{userName}}! 👋</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome to Mall of Cayman! We're thrilled to have you join our community of shoppers.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Please click the button below to verify your email address and activate your account:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{activationUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{primaryColor}}, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                      ✅ Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link in your browser:<br>
                <a href="{{activationUrl}}" style="color: {{primaryColor}}; word-break: break-all;">{{activationUrl}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                If you didn't create this account, please ignore this email.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Password Reset",
    slug: "password_reset",
    description: "Email sent when a user requests to reset their password",
    subject: "Reset Your Password - Mall of Cayman",
    availableVariables: [
      { variable: "{{userName}}", description: "Name of the user", required: true },
      { variable: "{{resetUrl}}", description: "URL to reset password (DO NOT REMOVE)", required: true },
      { variable: "{{email}}", description: "User's email address", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Mall of Cayman</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Hi {{userName}},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{primaryColor}}, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                      🔑 Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link in your browser:<br>
                <a href="{{resetUrl}}" style="color: {{primaryColor}}; word-break: break-all;">{{resetUrl}}</a>
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email or contact support.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated email. Please do not reply.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Shop Approved",
    slug: "shop_approved",
    description: "Email sent when admin approves a seller's shop",
    subject: "Congratulations! Your Shop is Approved - {{shopName}}",
    availableVariables: [
      { variable: "{{shopName}}", description: "Name of the shop", required: true },
      { variable: "{{sellerName}}", description: "Name of the seller", required: false },
      { variable: "{{loginUrl}}", description: "URL to login to seller dashboard", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Shop Has Been Approved</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Welcome to Mall of Cayman, {{shopName}}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! Your shop application has been reviewed and <strong style="color: #22c55e;">approved</strong> by our admin team.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                You can now log in to your seller dashboard and start listing your products!
              </p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">🚀 Next Steps:</h3>
                <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Complete your shop profile</li>
                  <li>Add your first products</li>
                  <li>Set up your payment methods</li>
                  <li>Configure shipping options</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{loginUrl}}" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
                      🏪 Go to Seller Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                Need help? Contact our seller support team.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Shop Rejected",
    slug: "shop_rejected",
    description: "Email sent when admin rejects a seller's shop application",
    subject: "Shop Application Update - {{shopName}}",
    availableVariables: [
      { variable: "{{shopName}}", description: "Name of the shop", required: true },
      { variable: "{{sellerName}}", description: "Name of the seller", required: false },
      { variable: "{{rejectionReason}}", description: "Reason for rejection", required: true },
      { variable: "{{supportEmail}}", description: "Support email address", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📋 Application Update</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Mall of Cayman</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Hello {{shopName}},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in selling on Mall of Cayman. After reviewing your application, we regret to inform you that we are unable to approve your shop at this time.
              </p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">📝 Reason:</h3>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
                  {{rejectionReason}}
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                You may address the above concerns and submit a new application. If you believe this decision was made in error, please contact our support team.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Contact us at: <a href="mailto:{{supportEmail}}" style="color: {{primaryColor}};">{{supportEmail}}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                We appreciate your understanding.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Order Confirmation",
    slug: "order_confirmation",
    description: "Email sent to customers when they place an order",
    subject: "Order Confirmed! #{{orderNumber}}",
    availableVariables: [
      { variable: "{{userName}}", description: "Customer's name", required: true },
      { variable: "{{orderNumber}}", description: "Order number", required: true },
      { variable: "{{orderTotal}}", description: "Total order amount", required: true },
      { variable: "{{orderItems}}", description: "HTML list of ordered items", required: false },
      { variable: "{{shippingAddress}}", description: "Delivery address", required: false },
      { variable: "{{orderUrl}}", description: "URL to view order details", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Order #{{orderNumber}}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Thank you, {{userName}}! 🛍️</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your order has been successfully placed and is being processed. We'll notify you when it ships!
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: {{secondaryColor}}; margin: 0 0 15px 0; font-size: 16px;">📦 Order Summary</h3>
                {{orderItems}}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                <p style="color: {{secondaryColor}}; font-size: 18px; font-weight: bold; margin: 0; text-align: right;">
                  Total: {{orderTotal}}
                </p>
              </div>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 14px;">📍 Shipping Address:</h4>
                <p style="color: #1e3a8a; font-size: 14px; margin: 0; line-height: 1.6;">
                  {{shippingAddress}}
                </p>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{orderUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{primaryColor}}, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                      📋 View Order Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                Questions about your order? Contact our support team.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Order Status Update",
    slug: "order_status_update",
    description: "Email sent when order status changes (shipped, delivered, etc.)",
    subject: "Order Update: {{statusText}} - #{{orderNumber}}",
    availableVariables: [
      { variable: "{{userName}}", description: "Customer's name", required: true },
      { variable: "{{orderNumber}}", description: "Order number", required: true },
      { variable: "{{statusText}}", description: "New status (e.g., Shipped, Delivered)", required: true },
      { variable: "{{statusMessage}}", description: "Detailed status message", required: false },
      { variable: "{{trackingNumber}}", description: "Shipping tracking number", required: false },
      { variable: "{{orderUrl}}", description: "URL to view order details", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📦 Order Update</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Order #{{orderNumber}}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Hi {{userName}}!</h2>
              
              <div style="background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="color: #166534; font-size: 20px; font-weight: bold; margin: 0;">
                  {{statusText}}
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                {{statusMessage}}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Tracking Number: <strong>{{trackingNumber}}</strong>
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{orderUrl}}" style="display: inline-block; background: linear-gradient(135deg, {{primaryColor}}, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                      📋 Track Order
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    name: "Newsletter Welcome",
    slug: "newsletter_welcome",
    description: "Email sent when someone subscribes to the newsletter",
    subject: "Welcome to Mall of Cayman Newsletter! 🎉",
    availableVariables: [
      { variable: "{{email}}", description: "Subscriber's email", required: true },
      { variable: "{{unsubscribeUrl}}", description: "URL to unsubscribe", required: false },
    ],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: {{backgroundColor}};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{backgroundColor}}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}}, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">You're Now Subscribed</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: {{secondaryColor}}; margin: 0 0 20px 0; font-size: 24px;">Thanks for Subscribing!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You'll now receive exclusive deals, new arrivals, and special offers directly in your inbox.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Stay tuned for amazing discounts! 🛍️
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 25px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                <a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{footerText}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

// Initialize default templates
router.post(
  "/init-templates",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let created = 0;
      let updated = 0;

      for (const template of defaultTemplates) {
        const existing = await EmailTemplate.findOne({ slug: template.slug });

        if (!existing) {
          await EmailTemplate.create({
            ...template,
            defaultHtmlBody: template.htmlBody,
            defaultSubject: template.subject,
          });
          created++;
        } else {
          // Update default values but keep custom changes
          existing.defaultHtmlBody = template.htmlBody;
          existing.defaultSubject = template.subject;
          existing.availableVariables = template.availableVariables;
          await existing.save();
          updated++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Templates initialized: ${created} created, ${updated} updated`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all email templates
router.get(
  "/all",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const templates = await EmailTemplate.find().sort({ name: 1 });

      res.status(200).json({
        success: true,
        templates,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get single template by slug
router.get(
  "/:slug",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const template = await EmailTemplate.findOne({ slug: req.params.slug });

      if (!template) {
        return next(new ErrorHandler("Template not found", 404));
      }

      res.status(200).json({
        success: true,
        template,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update template
router.put(
  "/:slug",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { subject, htmlBody, styling, isActive } = req.body;

      const template = await EmailTemplate.findOne({ slug: req.params.slug });

      if (!template) {
        return next(new ErrorHandler("Template not found", 404));
      }

      if (subject) template.subject = subject;
      if (htmlBody) template.htmlBody = htmlBody;
      if (styling) template.styling = { ...template.styling, ...styling };
      if (typeof isActive === "boolean") template.isActive = isActive;

      template.lastModifiedBy = req.user._id;

      await template.save();

      res.status(200).json({
        success: true,
        message: "Template updated successfully",
        template,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reset template to default
router.put(
  "/:slug/reset",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const template = await EmailTemplate.findOne({ slug: req.params.slug });

      if (!template) {
        return next(new ErrorHandler("Template not found", 404));
      }

      template.htmlBody = template.defaultHtmlBody;
      template.subject = template.defaultSubject;
      template.lastModifiedBy = req.user._id;

      await template.save();

      res.status(200).json({
        success: true,
        message: "Template reset to default",
        template,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Preview template with sample data
router.post(
  "/:slug/preview",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { variables } = req.body;

      const template = await EmailTemplate.findOne({ slug: req.params.slug });

      if (!template) {
        return next(new ErrorHandler("Template not found", 404));
      }

      const rendered = template.render(variables || {});

      res.status(200).json({
        success: true,
        preview: rendered,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Send test email
router.post(
  "/:slug/test",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { testEmail, variables } = req.body;
      const sendMail = require("../utils/sendMail");

      if (!testEmail) {
        return next(new ErrorHandler("Test email address is required", 400));
      }

      const template = await EmailTemplate.findOne({ slug: req.params.slug });

      if (!template) {
        return next(new ErrorHandler("Template not found", 404));
      }

      const rendered = template.render(variables || {});

      await sendMail({
        email: testEmail,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
      });

      res.status(200).json({
        success: true,
        message: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update global styling for all templates
router.put(
  "/styling/global",
  isAuthenticated,
  requirePermission("canManageSettings"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { styling } = req.body;

      if (!styling) {
        return next(new ErrorHandler("Styling data is required", 400));
      }

      await EmailTemplate.updateMany(
        {},
        {
          $set: {
            "styling.primaryColor": styling.primaryColor,
            "styling.secondaryColor": styling.secondaryColor,
            "styling.backgroundColor": styling.backgroundColor,
            "styling.fontFamily": styling.fontFamily,
            "styling.logoUrl": styling.logoUrl,
            "styling.footerText": styling.footerText,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: "Global styling updated for all templates",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
