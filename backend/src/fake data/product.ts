import { Product } from "../models/products.js";
import { faker } from "@faker-js/faker";
export const generateRandomProducts = async (count: number = 10) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\c3a4046e-fe97-419d-a552-b798971a96fe.jpg",
            price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
            stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent()),
            __v: 0,
        };

        products.push(product);
    }

    await Product.create(products);

    console.log({ succecss: true });
};
