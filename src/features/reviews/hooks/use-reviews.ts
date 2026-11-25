"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { reviewsApi } from "../api/reviews.api";
import type { ReviewFilters, ReviewSettings, ReviewState } from "../types/review.types";
export const reviewKeys = { all: ["reviews"] as const, lists: () => [...reviewKeys.all, "list"] as const, list: (filters: ReviewFilters) => [...reviewKeys.lists(), filters] as const, settings: () => [...reviewKeys.all, "settings"] as const };
export function useReviews(filters: ReviewFilters) { return useQuery({ queryKey: reviewKeys.list(filters), queryFn: () => reviewsApi.list(filters) }); }
export function useReviewSettings() { return useQuery({ queryKey: reviewKeys.settings(), queryFn: reviewsApi.settings }); }
function useReviewMutation<T>(mutationFn: (input: T) => Promise<unknown>, success: string) {
  const apiErrorMessage = useApiErrorMessage();
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: async () => { await client.invalidateQueries({ queryKey: reviewKeys.all }); toast.success(success); }, onError: (error) => toast.error(apiErrorMessage(error)) });
}
export function useUpdateReviewSettings() { return useReviewMutation((payload: ReviewSettings) => reviewsApi.updateSettings(payload), "Review settings updated"); }
export function useModerateReview() { return useReviewMutation((input: { id: string; state: Exclude<ReviewState, "pending">; reason?: string }) => reviewsApi.moderate(input.id, input.state, input.reason), "Review moderation saved"); }
export function useRestoreReview() { return useReviewMutation((input: { id: string; reason?: string }) => reviewsApi.restore(input.id, input.reason), "Review restored as hidden"); }
