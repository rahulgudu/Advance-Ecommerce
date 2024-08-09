import express from "express";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
// imports
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import statisticsRoutes from "./routes/stats.js";

config({
  path: "./.env",
});
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGOURI || "";
connectDB(mongoURI);
const stripeKey = process.env.STRIPE_KEY || "";

// node cache
export const myCache = new NodeCache();

// stripe
export const stripe = new Stripe(stripeKey);

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors())

app.get("/", (req, res) => {
  res.send("<h1>App is healthy</h1>");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/statistics", statisticsRoutes);

app.use("/uploads", express.static("uploads"));
app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
