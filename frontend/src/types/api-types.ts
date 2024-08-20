import { Product, User } from "./types";
export type CustomError = {
  status: number;
  data: {
    message: string;
    success: boolean;
  };
};
export type MessageResponse = {
  success: boolean;
  message: string;
};
export type UserResponse = {
  success: boolean;
  user: User;
};
export type AllProductsResposne = {
  success: boolean;
  products: Product[];
};

export type AllCategoryResponse = {
  success: boolean;
  categories: string[];
};

export type SearchProductsResponse = {
  success: boolean;
  products: Product[];
  totalPage: number;
};

export type SearchProductsRequest = {
  price: number;
  page: number;
  category: string;
  sort: string;
  search: string;
};
export type NewProductRequest = {
  id: string;
  formData: FormData;
};

export type ProductResponse = {
  success: boolean;
  product: Product;
};

export type UpdateProductRequest = {
  userId: string;
  productId: string;
  formData: FormData;
};

export type DeleteProductRequest = {
  userId: string;
  productId: string;
};
