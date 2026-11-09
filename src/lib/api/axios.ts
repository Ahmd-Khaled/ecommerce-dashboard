import axios from "axios";
import { getAdminAccessToken } from "./token-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAdminAccessToken();

  if (token) {
    config.headers.Authorization = `admin ${token}`;
  }

  return config;
});

export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "An unexpected API error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};