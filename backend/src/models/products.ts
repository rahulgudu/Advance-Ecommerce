import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: [true, "Please enter Photo"]
    },
    price: {
        type: Number,
        required: [true, "Please enter Price"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter stock"]
    },
    category: {
        type: String,
        required: [true, "Please enter category"],
        trim: true
    }
}, { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);