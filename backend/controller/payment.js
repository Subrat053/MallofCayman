const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const ErrorHandler = require("../utils/ErrorHandler");

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ErrorHandler("Stripe is not configured on server", 500);
  }
  return require("stripe")(process.env.STRIPE_SECRET_KEY);
};

router.post(
  "/process",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const stripe = getStripeClient();
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const myPayment = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: process.env.STRIPE_CURRENCY || "usd",
      metadata: {
        company: "MallOfCayman",
      },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

router.get(
  "/stripeapikey",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
  })
);

router.post(
  "/stripe/create-order-checkout-session",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const stripe = getStripeClient();
    const {
      amount,
      currency = process.env.STRIPE_CURRENCY || "usd",
      successUrl,
      cancelUrl,
      metadata = {},
    } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return next(new ErrorHandler("Invalid checkout amount", 400));
    }

    if (!successUrl || !cancelUrl) {
      return next(new ErrorHandler("Success and cancel URLs are required", 400));
    }

    const unitAmount = Math.round(parsedAmount * 100);
    const safeMetadata = {
      ...Object.fromEntries(
        Object.entries(metadata || {}).map(([key, value]) => [
          String(key).slice(0, 40),
          String(value).slice(0, 450),
        ])
      ),
      contextType: "order_checkout",
      userId: req.user?._id?.toString() || "",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            product_data: {
              name: "Mall of Cayman Order Payment",
            },
            unit_amount: unitAmount,
          },
        },
      ],
      metadata: safeMetadata,
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  })
);

router.get(
  "/stripe/verify-session/:sessionId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const stripe = getStripeClient();
    const { sessionId } = req.params;

    if (!sessionId) {
      return next(new ErrorHandler("Session ID is required", 400));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const isPaid = session.payment_status === "paid";
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    return res.status(200).json({
      success: true,
      isPaid,
      paymentStatus: session.payment_status,
      paymentIntentId,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {},
    });
  })
);

module.exports = router;
