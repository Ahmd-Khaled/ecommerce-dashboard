
import { api } from "@/lib/api/axios";

import type {
  Category,
  CategoryApiResponse,
  CategoryPayload,
} from "../types/category.types";

function createCategoryFormData(
  payload: CategoryPayload,
  isUpdate = false,
): FormData {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  formData.append("description", payload.description ?? "");
  formData.append("isActive", String(payload.isActive));
  formData.append("sortOrder", String(payload.sortOrder));

  if (payload.parent) {
    formData.append("parent", payload.parent);
  }
  // else if (isUpdate) {
  //   // The backend interprets null as moving to root.
  //   formData.append("parent", "");
  // }

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<
      CategoryApiResponse<{ categories: Category[] }>
    >("/categories");

    return data.data.categories;
  },

  async getCategory(id: string): Promise<Category> {
    const { data } = await api.get<
      CategoryApiResponse<{ category: Category }>
    >(`/categories/${id}`);

    return data.data.category;
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const formData = createCategoryFormData(payload);

    const { data } = await api.post<
      CategoryApiResponse<{ category: Category }>
    >("/categories", formData);

    return data.data.category;
  },

  async updateCategory(
    id: string,
    payload: CategoryPayload,
  ): Promise<Category> {
    const formData = createCategoryFormData(payload, true);

    const { data } = await api.patch<
      CategoryApiResponse<{ category: Category }>
    >(`/categories/${id}`, formData);

    return data.data.category;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
