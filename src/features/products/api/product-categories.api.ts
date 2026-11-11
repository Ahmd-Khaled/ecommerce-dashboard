import { api } from "@/lib/api/axios";

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const productCategoriesApi = {
  async getCategories(): Promise<ProductCategory[]> {
    const { data } = await api.get<
      ApiResponse<{ categories: ProductCategory[] }>
    >("/categories");

    return data.data.categories.filter((category) => category.isActive);
  },
};