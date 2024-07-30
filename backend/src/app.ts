import express from "express";
import { connectDB } from "./utils/features.js";
import NodeCache from "node-cache";
import {config} from "dotenv"
import morgan from "morgan";
// imports
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

config({
    path: "./.env"
})
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGOURI || "";
connectDB(mongoURI);

// node cache
export const myCache = new NodeCache();

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"))

app.get("/", (req, res) => {
    res.send("<h1>App is healthy</h1>");
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);

app.use("/uploads", express.static("uploads"));
app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`)
})