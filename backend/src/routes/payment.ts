import express from "express";
import { applyDiscount, deleteCoupon, getAllCoupons, newCoupon } from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/coupon/new", newCoupon);
app.get("/discount", applyDiscount);

app.get("/all-coupons",adminOnly, getAllCoupons);
app.delete("/delete-coupon/:id", adminOnly, deleteCoupon);

export default app;