import { api } from "@/lib/api/axios";

import type {
  CreateProductPayload,
  ProductFilters,
  ProductListResponse,
  Product,
  UpdateProductPayload,
} from "../types/product.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type ProductFormPayload = Omit<
  CreateProductPayload,
  "images"
> & {
  images: string[];
  imageFiles: File[];
};

type UpdateProductFormPayload = Partial<
  Omit<UpdateProductPayload, "images">
> & {
  images?: string[];
  imageFiles?: File[];
};

function createProductFormData(
  payload: ProductFormPayload | UpdateProductFormPayload,
) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "imageFiles" || value === undefined) return;

    if (key === "images") {
      // The backend accepts either image files OR image URLs,
      // but not both in the same multipart request.
      if (Array.isArray(value) && value.length > 0) {
        formData.append("images", JSON.stringify(value));
      }

      return;
    }

    if (value === null) {
      formData.append(key, "");
      return;
    }

    formData.append(key, String(value));
  });

  if (payload.imageFiles?.length) {
    // New files replace the existing image set.
    // Do not append the existing image URLs in this case.
    formData.delete("images");

    payload.imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}

export const productsApi = {
  async getProducts(
    filters: ProductFilters,
  ): Promise<ProductListResponse> {
    const { data } = await api.get<ApiResponse<ProductListResponse>>(
      "/products",
      { params: filters },
    );

    return data.data;
  },

  async getProduct(productId: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<{ product: Product }>>(
      `/products/${productId}`,
    );

    return data.data.product;
  },

  async createProduct(
    payload: ProductFormPayload,
  ): Promise<Product> {
    const formData = createProductFormData(payload);

    const { data } = await api.post<ApiResponse<{ product: Product }>>(
      "/products",
      formData,
    );

    return data.data.product;
  },

  async updateProduct(
    productId: string,
    payload: UpdateProductFormPayload,
  ): Promise<Product> {
    const formData = createProductFormData(payload);

    const { data } = await api.patch<ApiResponse<{ product: Product }>>(
      `/products/${productId}`,
      formData,
    );

    return data.data.product;
  },

  async deleteProduct(productId: string): Promise<void> {
    await api.delete(`/products/${productId}`);
  },
};