import express from "express";
import { connectDB } from "./utils/features.js";

// imports
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/products.js";

const port = 3000;
connectDB();
const app = express();

// middleware
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>App is healthy</h1>");
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);

app.use("/uploads", express.static("uploads"));
app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`)
})