"use client";

import { useQuery } from "@tanstack/react-query";
import { homepagePreviewApi } from "../api/homepage-preview.api";

export function useHomepagePreview(view: "desktop" | "mobile", locale: string) {
  return useQuery({
    queryKey: ["homepage-preview", locale, view],
    queryFn: () => homepagePreviewApi.get(view, locale),
  });
}
