import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupons.js";
import ErrorHandler from "../utils/utility-class.js";

export const paymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Please enter amount", 400));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "INR",
    payment_method_types: ["card"]
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  await Coupon.create({
    code: coupon,
    amount,
  });

  return res.status(201).json({
    status: true,
    message: `Coupon ${coupon} is created`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) {
    return next(new ErrorHandler("Invalid Coupon Code", 400));
  }

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const getAllCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});
  if (!coupons) {
    return next(new ErrorHandler("Coupons not found", 400));
  }

  res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id: couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);

  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  res.status(200).json({
    success: true,
    message: `Coupon deleted ${coupon.code}`,
  });
});
