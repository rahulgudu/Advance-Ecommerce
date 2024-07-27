import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/products.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

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

    await invalidateCache({ product: true });

    return res.status(201).json({
        sucess: true,
        message: "Product created successfully"
    });
});

export const getLatestProduct = TryCatch(async (req, res, next) => {

    let products;

    if (myCache.has("latest-product")) {
        // if already exists in cache then return
        products = JSON.parse(myCache.get("latest-product") as string)
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

        // storing in cache
        myCache.set("latest-product", JSON.stringify(products))
    }


    return res.status(200).json({
        success: true,
        products
    });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;

    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string)
    }
    else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(200).json({
        success: true,
        categories
    });
});

export const getAllProducts = TryCatch(async (req, res, next) => {
    let products;

    if (myCache.has("all-products")) {
        products = JSON.parse(myCache.get("all-products") as string);
    } else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products))
    }



    return res.status(200).json({
        sucess: true,
        products
    });
});

export const getProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;

    let product;

    if (myCache.has(`single-product-${id}`)) {
        product = JSON.parse(myCache.get(`single-product-${id}`) as string)
    } else {
        product = await Product.findById(id);
        
        myCache.set(`single-product-${id}`, JSON.stringify(product))
    }


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

    await invalidateCache({ product: true });

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
    const id  = req.params.id;
    
    const product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Invalid Product Id", 404));

    rm(product.photo!, () => {
        console.log("Product photo deleted");

    });

    await product.deleteOne();

    await invalidateCache({ product: true });

    return res.status(200).json({
        success: true,
        message: `Product deleted successfully with ID: ${id}`
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