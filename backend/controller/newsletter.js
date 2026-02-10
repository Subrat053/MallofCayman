const express = require("express");
const Newsletter = require("../model/newsletter");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendMail = require("../utils/sendMail");
const EmailTemplate = require("../model/emailTemplate");

const router = express.Router();

// Subscribe to newsletter
router.post(
  "/subscribe",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new ErrorHandler("Please provide an email address", 400));
      }

      // Check if email already exists
      const existingSubscription = await Newsletter.findOne({ email });

      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return next(new ErrorHandler("Email is already subscribed to our newsletter", 400));
        } else {
          // Reactivate subscription
          existingSubscription.isActive = true;
          existingSubscription.subscribedAt = Date.now();
          existingSubscription.unsubscribedAt = undefined;
          await existingSubscription.save();

          return res.status(200).json({
            success: true,
            message: "Successfully resubscribed to our newsletter!",
          });
        }
      }

      // Create new subscription
      const newsletter = await Newsletter.create({
        email,
      });

      // Send welcome email
      try {
        // Fetch the email template from database
        let template = await EmailTemplate.findOne({ slug: 'newsletter_welcome' });
        
        let emailSubject, emailHtml;
        // const unsubscribeUrl = `https://www.mallofcayman.com/unsubscribe?email=${encodeURIComponent(email)}`;
        const unsubscribeUrl = `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
        
        if (template) {
          const variables = {
            email: email,
            unsubscribeUrl: unsubscribeUrl
          };
          const rendered = template.render(variables);
          emailSubject = rendered.subject;
          emailHtml = rendered.html;
        } else {
          emailSubject = "Welcome to Mall of Cayman Newsletter! 🎉";
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
                          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Welcome to Our Newsletter! 🎉</h2>
                          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Thank you for subscribing! You're now part of our exclusive community.
                          </p>
                          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #9a3412; font-weight: bold;">As a subscriber, you'll receive:</p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #9a3412;">
                              <li>Exclusive deals and discounts</li>
                              <li>Early access to sales</li>
                              <li>New product announcements</li>
                              <li>Special offers just for you</li>
                            </ul>
                          </div>
                          <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                            We're excited to have you as part of our community!
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            If you wish to unsubscribe, <a href="${unsubscribeUrl}" style="color: #f97316;">click here</a>.
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
          email: email,
          subject: emailSubject,
          message: `Thank you for subscribing to Mall of Cayman newsletter! You'll receive exclusive deals, early access to sales, and new product announcements.`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.log("Welcome email failed to send:", emailError.message);
        // Don't fail the subscription if email fails
      }

      res.status(201).json({
        success: true,
        message: "Successfully subscribed to our newsletter!",
        data: {
          email: newsletter.email,
          subscribedAt: newsletter.subscribedAt,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unsubscribe from newsletter
router.post(
  "/unsubscribe",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new ErrorHandler("Please provide an email address", 400));
      }

      const subscription = await Newsletter.findOne({ email });

      if (!subscription) {
        return next(new ErrorHandler("Email not found in our newsletter list", 404));
      }

      if (!subscription.isActive) {
        return next(new ErrorHandler("Email is already unsubscribed", 400));
      }

      // Deactivate subscription
      subscription.isActive = false;
      subscription.unsubscribedAt = Date.now();
      await subscription.save();

      res.status(200).json({
        success: true,
        message: "Successfully unsubscribed from our newsletter",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all active subscriptions (Admin only)
router.get(
  "/subscribers",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subscribers = await Newsletter.find({ isActive: true }).sort({
        subscribedAt: -1,
      });

      res.status(200).json({
        success: true,
        count: subscribers.length,
        subscribers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get newsletter statistics (Admin only)
router.get(
  "/stats",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
      const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
      const totalEmails = await Newsletter.countDocuments();

      // Get recent subscriptions (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSubscriptions = await Newsletter.countDocuments({
        isActive: true,
        subscribedAt: { $gte: thirtyDaysAgo },
      });

      res.status(200).json({
        success: true,
        stats: {
          totalSubscribers,
          totalUnsubscribed,
          totalEmails,
          recentSubscriptions,
          subscriptionRate: totalEmails > 0 ? (totalSubscribers / totalEmails * 100).toFixed(2) : 0,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;