import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};

  if (myCache.has("admin-stats")) {
    stats = JSON.parse(myCache.get("admin-stats") as string);
  } else {
    const today = new Date();
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    });

    const thisMonthUsersPromise = User.find({
      createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
    });

    const lastMonthUsersPromise = User.find({
      createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    });

    const thisMonthOrdersPromise = Order.find({
      createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    });

    const lastSixMonthsOrderPromise = Order.find({
      createdAt: { $gte: sixMonthAgo, $lte: today },
    });

    const latestTransactionPromise = Order.find({})
      .select(["id", "orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthsOrder,
      categories,
      femaleUserCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total").lean(),
      lastSixMonthsOrderPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,
      order: allOrders.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);

    lastSixMonthsOrder.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = today.getMonth() - creationDate.getMonth();
      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
      });
    });

    const userRatio = {
      male: usersCount - femaleUserCount,
      female: femaleUserCount,
    };

    const modifiedTransactions = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      latestTransaction: modifiedTransactions,
    };

    myCache.set("admin-stats", JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts = {};
  if (myCache.has("admin-pie-charts")) {
    charts = JSON.parse(myCache.get("admin-pie-charts") as string);
  } else {
    const processedOrderPromise = Order.countDocuments({
      status: "Processing",
    });
    const deliveredOrderPromise = Order.countDocuments({ status: "Delivered" });
    const shippedOrderPromise = Order.countDocuments({ status: "Shipped" });

    const categoriesPromise = Product.distinct("category");
    const productsCountPromise = Product.countDocuments();

    const productsOutOfStockPromise = Product.countDocuments({ stock: 0 });

    const allOrdersPromises = Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);

    const allUsersPromise = User.find({}).select(["dob"]);
    const adminUserPromise = User.countDocuments({ role: "admin" });
    const customerUserPromise = User.countDocuments({ role: "user" });

    const [
      processedOrder,
      deliveredOrder,
      shippedOrder,
      categories,
      productsCount,
      productsOutOfStock,
      allOrders,
      allUsers,
      adminUser,
      customerUser,
    ] = await Promise.all([
      processedOrderPromise,
      deliveredOrderPromise,
      shippedOrderPromise,
      categoriesPromise,
      productsCountPromise,
      productsOutOfStockPromise,
      allOrdersPromises,
      allUsersPromise,
      adminUserPromise,
      customerUserPromise,
    ]);

    const orderFullfillment = {
      processing: processedOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
      });
    });

    const stockAvalibilty = {
      inStock: productsCount - productsOutOfStock,
      outOfStock: productsOutOfStock,
    };

    const totalGrossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burn = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(totalGrossIncome * (30 / 100));

    const netMargin =
      totalGrossIncome - discount - productionCost - burn - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      marketingCost,
    };

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUsers.filter((i) => i.age >= 40).length,
    };

    const adminCustomer = {
      admin: adminUser,
      customer: customerUser,
    };

    charts = {
      orderFullfillment,
      categoryCount,
      stockAvalibilty,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    myCache.set("admin-pie-charts", JSON.stringify(charts));
  }

  res.status(200).json({
    status: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async () => {});

export const getLineCharts = TryCatch(async () => {});
