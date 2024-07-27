import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAllCategories, getAllProducts, getLatestProduct, getProduct, getSearchedProducts, newProduct, updateProduct } from "../controllers/products.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();

app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/all", getSearchedProducts);
app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);

app.get("/admin-products", adminOnly, getAllProducts);

//chaning
app.route("/:id").get(getProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct);

export default app;