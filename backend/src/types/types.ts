import { NextFunction, Request, Response } from "express"

export interface NewUserRequestBody {
    name: string,
    email: string,
    photo: string,
    gender: string,
    _id: string,
    dob: Date
}

export type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
) =>
    Promise<void | Response<string, any>>

export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
}

export type SearchRequestQuery = {
    search?: string,
    name?: string,
    price?: string,
    category?: string,
    sort?: string,
    page?: string
}

export interface BaseQuery {
    name?: {
        $regex: string,
        $options: string
    };
    price?: { $lte: number };
    category?: string
}

export type InvalidateCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string;
    productId?: string | string[];
}

export type OrderItem = {
    name: string,
    photo: string,
    price: number,
    quantity: number,
    productId: string
}
export type ShippingInfo = {
    address: string,
    city: string,
    state: string,
    country: string,
    pinCode: number
}
export interface NewOrderRequestBody {
    shippingInfo: ShippingInfo;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItem[]
}