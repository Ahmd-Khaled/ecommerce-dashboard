import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAdminAccessToken,
  getAdminAccessToken,
  setAdminAccessToken,
} from "./token-store";

const API_URL = "/api/v1";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

type RefreshResponse = {
  success: boolean;
  tokens: {
    accessToken: string;
    tokenType?: string;
  };
};

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;
let sessionBootstrapInProgress = false;

export function setAdminSessionBootstrapInProgress(inProgress: boolean): void {
  sessionBootstrapInProgress = inProgress;
}

export async function refreshAdminAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>("/admin/auth/refresh-token", {})
      .then(({ data }) => {
        const token = data.tokens?.accessToken;

        if (!token) {
          throw new Error("Refresh response did not contain an access token");
        }

        setAdminAccessToken(token);
        return token;
      })
      .catch((error: unknown) => {
        clearAdminAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAdminAccessToken();

  if (token) {
    config.headers.set("Authorization", `admin ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      sessionBootstrapInProgress ||
      originalRequest.url?.includes("/admin/auth/login") ||
      originalRequest.url?.includes("/admin/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAdminAccessToken();

      originalRequest.headers.set("Authorization", `admin ${newToken}`);

      return api(originalRequest);
    } catch (refreshError) {
      clearAdminAccessToken();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin-session-expired"));
      }

      return Promise.reject(refreshError);
    }
  },
);

export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    return error.message || "An unexpected API error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};
