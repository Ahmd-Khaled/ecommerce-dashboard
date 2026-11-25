"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { apiErrorMessage } from "./axios";
import { getRequestId } from "./request-id";

export function useApiErrorMessage() {
  const t = useTranslations("ApiError");
  return useCallback((error: unknown): string => {
    const message = apiErrorMessage(error);
    const requestId = getRequestId(error);
    return requestId ? `${message}\n${t("reference", { requestId })}` : message;
  }, [t]);
}
