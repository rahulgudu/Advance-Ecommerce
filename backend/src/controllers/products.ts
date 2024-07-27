import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/products.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";

export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) {
        return next(new ErrorHandler("Please add photo", 400))
    }

    if (!name || !price || !stock || !category) {
        rm(photo.path, () => {
            console.log("Deleted")
        })
        return next(new ErrorHandler("Please enter all fields", 400))
    }

    await Product.create({
        name, price, stock, category: category.toLowerCase(),
        photo: photo.path
    });

    return res.status(201).json({
        sucess: true,
        message: "Product created successfully"
    });
});

export const getLatestProduct = TryCatch(async (req, res, next) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
        success: true,
        products
    });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
    const categories = await Product.distinct("category");

    return res.status(200).json({
        success: true,
        categories
    });
});

export const getAllProducts = TryCatch(async (req, res, next) => {
    const categories = await Product.find({});

    return res.status(200).json({
        sucess: true,
        categories
    });
});

export const getProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandler("Invalid product Id", 404));
    }

    return res.status(200).json({
        success: true,
        product
    })
});

export const updateProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Invalid Product Id", 404));

    if (photo) {
        rm(product.photo!, () => {
            console.log("Old photo delted");
        });
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("Invalid Product Id", 404));

    rm(product.photo!, () => {
        console.log("Product photo deleted");

    });

    await Product.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });

});

export const getSearchedProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {}

    if (search) baseQuery.name = {
        $regex: search,
        $options: "i"
    }
    if (price) baseQuery.price = {
        $lte: Number(price)
    }

    if (category) {
        baseQuery.category = category;
    }

    const productPromise = Product.find(baseQuery).sort(sort && { price: sort === "asc" ? 1 : -1 }).limit(limit).skip(skip)

    const [products, filteredOnlyProduct] = await Promise.all([
        productPromise,
        Product.find(baseQuery),
    ])



    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
});