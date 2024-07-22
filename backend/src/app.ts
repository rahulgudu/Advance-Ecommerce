import express from "express";
import userRoutes from "./routes/user.js";
import { connectDB } from "./utils/features.js";
const port = 3000;
connectDB();
const app = express();

// middleware
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>App is healthy</h1>");
})

app.use("/api/v1/user", userRoutes);


app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`)
})