import { api } from "@/lib/api/axios";
import type { HomepageResponse } from "../types/homepage.types";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export const homepagePreviewApi = {
  async get(view: "desktop" | "mobile", locale: string) {
    const { data } = await api.get<ApiResponse<HomepageResponse>>("/home", {
      params: { view, limit: 8 },
      headers: { "Accept-Language": locale },
    });
    return data.data;
  },
};
