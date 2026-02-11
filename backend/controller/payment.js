const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/process",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
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

module.exports = router;
