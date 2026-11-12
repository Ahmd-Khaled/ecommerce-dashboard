import { api } from "@/lib/api/axios";
import type { Banner, BannerFilters, BannerListResponse, BannerPayload } from "../types/banner.types";

type ApiResponse<T> = { success: boolean; message: string; data: T };

function toFormData(payload: BannerPayload) {
  const formData = new FormData();
  formData.append("language", payload.language);
  formData.append("view", payload.view);
  formData.append("title", payload.title ?? "");
  formData.append("altText", payload.altText ?? "");
  formData.append("linkUrl", payload.linkUrl ?? "");
  formData.append("sortOrder", String(payload.sortOrder));
  formData.append("isActive", String(payload.isActive));
  formData.append("startsAt", payload.startsAt ?? "");
  formData.append("endsAt", payload.endsAt ?? "");
  if (payload.imageFile) formData.append("image", payload.imageFile);
  return formData;
}

function toJson(payload: BannerPayload) {
  const { imageFile: _imageFile, ...body } = payload;
  return { ...body, linkUrl: body.linkUrl || null, startsAt: body.startsAt || null, endsAt: body.endsAt || null };
}

export const bannersApi = {
  async list(filters: BannerFilters): Promise<BannerListResponse> {
    const { data } = await api.get<ApiResponse<BannerListResponse>>("/banners", { params: filters });
    return data.data;
  },
  async details(id: string): Promise<Banner> {
    const { data } = await api.get<ApiResponse<{ banner: Banner }>>(`/banners/${id}`);
    return data.data.banner;
  },
  async create(payload: BannerPayload): Promise<Banner> {
    if (!payload.imageFile) throw new Error("A banner image is required");
    const { data } = await api.post<ApiResponse<{ banner: Banner }>>("/banners", toFormData(payload));
    return data.data.banner;
  },
  async update(id: string, payload: BannerPayload): Promise<Banner> {
    const request = payload.imageFile ? toFormData(payload) : toJson(payload);
    const { data } = await api.patch<ApiResponse<{ banner: Banner }>>(`/banners/${id}`, request);
    return data.data.banner;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/banners/${id}`);
  },
};
