import { api } from "@/lib/api/axios";
import type { Review, ReviewFilters, ReviewList, ReviewSettings, ReviewState } from "../types/review.types";
type ApiResponse<T> = { success: boolean; data: T };
export const reviewsApi = {
  async list(filters: ReviewFilters): Promise<ReviewList> {
    const { data } = await api.get<ApiResponse<ReviewList>>("/admin/reviews", { params: filters });
    return data.data;
  },
  async settings(): Promise<ReviewSettings> {
    const { data } = await api.get<ApiResponse<ReviewSettings>>("/admin/reviews/settings");
    return data.data;
  },
  async updateSettings(payload: ReviewSettings): Promise<ReviewSettings> {
    const { data } = await api.patch<ApiResponse<ReviewSettings>>("/admin/reviews/settings", payload);
    return data.data;
  },
  async moderate(id: string, state: Exclude<ReviewState, "pending">, reason?: string): Promise<{ id: string; state: ReviewState }> {
    const { data } = await api.patch<ApiResponse<{ id: string; state: ReviewState }>>(`/admin/reviews/${id}/state`, { state, ...(reason ? { reason } : {}) });
    return data.data;
  },
  async restore(id: string, reason?: string): Promise<{ id: string; state: ReviewState }> {
    const { data } = await api.patch<ApiResponse<{ id: string; state: ReviewState }>>(`/admin/reviews/${id}/restore`, reason ? { reason } : {});
    return data.data;
  },
};
