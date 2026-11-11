"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { customerManagementApi } from "../api/customer-management.api";
import type {
  CustomerListParams,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer.types";

export const customerManagementKeys = {
  all: ["customer-management"] as const,
  list: (params: CustomerListParams) =>
    [...customerManagementKeys.all, "list", params] as const,
  details: (id: string) =>
    [...customerManagementKeys.all, "details", id] as const,
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

export function useCustomerList(params: CustomerListParams) {
  return useQuery({
    queryKey: customerManagementKeys.list(params),
    queryFn: () => customerManagementApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerDetails(id: string, enabled = true) {
  return useQuery({
    queryKey: customerManagementKeys.details(id),
    queryFn: () => customerManagementApi.details(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerInput) =>
      customerManagementApi.create(payload),
    onSuccess: async () => {
      toast.success("Customer created successfully");
      await queryClient.invalidateQueries({
        queryKey: customerManagementKeys.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCustomerInput;
    }) => customerManagementApi.update(id, payload),
    onSuccess: async () => {
      toast.success("Customer updated successfully");
      await queryClient.invalidateQueries({
        queryKey: customerManagementKeys.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerManagementApi.remove(id),
    onSuccess: async () => {
      toast.success("Customer deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: customerManagementKeys.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}