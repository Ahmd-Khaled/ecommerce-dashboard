"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { adminManagementApi } from "../api/admin-management.api";
import type {
  AdminListParams,
  CreateAdminInput,
  UpdateAdminInput,
} from "../types/admin.types";

export const adminManagementKeys = {
  all: ["admin-management"] as const,
  list: (params: AdminListParams) =>
    [...adminManagementKeys.all, "list", params] as const,
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return "Something went wrong. Please try again.";
}

export function useAdminList(params: AdminListParams) {
  return useQuery({
    queryKey: adminManagementKeys.list(params),
    queryFn: () => adminManagementApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminInput) =>
      adminManagementApi.create(payload),
    onSuccess: async () => {
      toast.success("Administrator created successfully");
      await queryClient.invalidateQueries({
        queryKey: adminManagementKeys.all,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAdminInput;
    }) => adminManagementApi.update(id, payload),
    onSuccess: async () => {
      toast.success("Administrator updated successfully");
      await queryClient.invalidateQueries({
        queryKey: adminManagementKeys.all,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminManagementApi.remove(id),
    onSuccess: async () => {
      toast.success("Administrator deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: adminManagementKeys.all,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}