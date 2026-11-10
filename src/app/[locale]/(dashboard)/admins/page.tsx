"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UnlockKeyhole,
  Users,
  X,
} from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import {
  useAdminList,
  useCreateAdmin,
  useDeleteAdmin,
  useUpdateAdmin,
} from "@/features/admin-management/hooks/use-admin-management";
import {
  createAdminSchema,
  updateAdminSchema,
  type CreateAdminFormValues,
  type UpdateAdminFormValues,
} from "@/features/admin-management/schemas/admin.schema";
import type {
  AdminRole,
  AdminStatus,
  ManagedAdmin,
} from "@/features/admin-management/types/admin.types";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";

const PAGE_SIZE = 10;
type ModalMode = "create" | "edit" | null;

function initials(admin: ManagedAdmin) {
  return ((admin.firstName[0] ?? "") + (admin.lastName[0] ?? "")).toUpperCase();
}

function statusClasses(status: AdminStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600";
    case "frozen":
      return "bg-amber-500/10 text-amber-600";
    case "deleted":
      return "bg-red-500/10 text-red-600";
  }
}

export default function AdminManagementPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("AdminManagement");
  const { admin: currentAdmin } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<ManagedAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedAdmin | null>(null);
  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [page, search, roleFilter, statusFilter],
  );
  const adminsQuery = useAdminList(params);
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();
  const admins = adminsQuery.data?.admins ?? [];
  const pagination = adminsQuery.data?.pagination;
  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    add: t("add"),
    search: t("search"),
    name: t("name"),
    role: t("role"),
    status: t("status"),
    created: t("created"),
    actions: t("actions"),
    active: t("active"),
    frozen: t("frozen"),
    deleted: t("deleted"),
    admin: t("admin"),
    superAdmin: t("superAdmin"),
    allRoles: t("allRoles"),
    allStatuses: t("allStatuses"),
    noResults: t("noResults"),
    loading: t("loading"),
    previous: t("previous"),
    next: t("next"),
    page: t("page"),
    of: t("of"),
    edit: t("edit"),
    freeze: t("freeze"),
    unfreeze: t("unfreeze"),
    delete: t("delete"),
    cancel: t("cancel"),
    deleteTitle: t("deleteTitle"),
    deleteDescription: t("deleteDescription"),
    total: t("total"),
    you: t("you"),
    protected: t("protected"),
  };
  const closeForm = () => {
    setModalMode(null);
    setSelectedAdmin(null);
  };
  const changeStatus = (item: ManagedAdmin) => {
    if (
      item.id === currentAdmin?._id ||
      item.role === AdminRoleEnum.SUPER_ADMIN ||
      item.status === "deleted"
    )
      return;
    void updateMutation.mutateAsync({
      id: item.id,
      payload: { status: item.status === "active" ? "frozen" : "active" },
    });
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {labels.title}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedAdmin(null);
            setModalMode("create");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          {labels.add}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{labels.total}</p>
            <p className="text-2xl font-bold">{pagination?.total ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            className={[
              "absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
              isArabic ? "right-3" : "left-3",
            ].join(" ")}
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={labels.search}
            className={[
              "h-10 w-full rounded-xl border border-input bg-background text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10",
              isArabic ? "pr-9 pl-3" : "pl-9 pr-3",
            ].join(" ")}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as AdminRole | "all");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">{labels.allRoles}</option>
          <option value={AdminRoleEnum.ADMIN}>{labels.admin}</option>
          <option value={AdminRoleEnum.SUPER_ADMIN}>{labels.superAdmin}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as AdminStatus | "all");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">{labels.allStatuses}</option>
          <option value="active">{labels.active}</option>
          <option value="frozen">{labels.frozen}</option>
          <option value="deleted">{labels.deleted}</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-4">{labels.name}</th>
                <th className="px-5 py-4">{labels.role}</th>
                <th className="px-5 py-4">{labels.status}</th>
                <th className="px-5 py-4">{labels.created}</th>
                <th className="px-5 py-4 text-end">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {labels.loading}
                    </p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    {labels.noResults}
                  </td>
                </tr>
              ) : (
                admins.map((item) => {
                  const isCurrentAdmin = item.id === currentAdmin?._id;
                  const isProtected =
                    isCurrentAdmin || item.role === AdminRoleEnum.SUPER_ADMIN;
                  const isDeleted = item.status === "deleted";
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(item)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {item.firstName} {item.lastName}
                              {isCurrentAdmin && (
                                <span className="ms-2 text-xs font-normal text-muted-foreground">
                                  ({labels.you})
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                          {item.role === AdminRoleEnum.SUPER_ADMIN && (
                            <ShieldCheck className="size-3.5" />
                          )}
                          {item.role === AdminRoleEnum.SUPER_ADMIN
                            ? labels.superAdmin
                            : labels.admin}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            statusClasses(item.status),
                          ].join(" ")}
                        >
                          {labels[item.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isProtected && !isDeleted && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAdmin(item);
                                  setModalMode("edit");
                                }}
                                title={labels.edit}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => changeStatus(item)}
                                title={
                                  item.status === "active"
                                    ? labels.freeze
                                    : labels.unfreeze
                                }
                                disabled={updateMutation.isPending}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                              >
                                {item.status === "active" ? (
                                  <LockKeyhole className="size-4" />
                                ) : (
                                  <UnlockKeyhole className="size-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                title={labels.delete}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                          {isProtected && (
                            <span className="px-2 text-xs text-muted-foreground">
                              {labels.protected}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {labels.page} {pagination?.page ?? page} {labels.of}{" "}
            {pagination?.totalPages ?? 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || adminsQuery.isFetching}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isArabic ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
              {labels.previous}
            </button>
            <button
              type="button"
              disabled={
                page >= (pagination?.totalPages ?? 1) || adminsQuery.isFetching
              }
              onClick={() =>
                setPage((value) =>
                  Math.min(pagination?.totalPages ?? value, value + 1),
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {labels.next}
              {isArabic ? (
                <ChevronLeft className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {modalMode && (
        <AdminFormDialog
          mode={modalMode}
          admin={selectedAdmin}
          isPending={createMutation.isPending || updateMutation.isPending}
          onClose={closeForm}
          onCreate={async (values) => {
            await createMutation.mutateAsync(values);
            closeForm();
          }}
          onUpdate={async (values) => {
            if (!selectedAdmin) return;
            await updateMutation.mutateAsync({
              id: selectedAdmin.id,
              payload: values,
            });
            closeForm();
          }}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{labels.deleteTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {labels.deleteDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label={labels.cancel}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {labels.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type AdminFormDialogProps = {
  mode: Exclude<ModalMode, null>;
  admin: ManagedAdmin | null;
  isPending: boolean;
  onClose: () => void;
  onCreate: (values: CreateAdminFormValues) => Promise<void>;
  onUpdate: (values: UpdateAdminFormValues) => Promise<void>;
};

function AdminFormDialog({
  mode,
  admin,
  isPending,
  onClose,
  onCreate,
  onUpdate,
}: AdminFormDialogProps) {
  const isCreate = mode === "create";
  const t = useTranslations("AdminManagement.dialog");
  const labels = {
    createTitle: t("createTitle"),
    editTitle: t("editTitle"),
    firstName: t("firstName"),
    lastName: t("lastName"),
    email: t("email"),
    password: t("password"),
    role: t("role"),
    admin: t("admin"),
    superAdmin: t("superAdmin"),
    cancel: t("cancel"),
    create: t("create"),
    save: t("save"),
  };
  const createForm = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: AdminRoleEnum.ADMIN,
    },
  });
  const editForm = useForm<UpdateAdminFormValues>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      firstName: admin?.firstName ?? "",
      lastName: admin?.lastName ?? "",
      role: admin?.role ?? AdminRoleEnum.ADMIN,
    },
  });
  const fieldClass =
    "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
  const labelClass = "mb-1.5 block text-sm font-medium";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">
            {isCreate ? labels.createTitle : labels.editTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label={labels.cancel}
          >
            <X className="size-4" />
          </button>
        </div>
        <form
          onSubmit={
            isCreate
              ? createForm.handleSubmit(onCreate)
              : editForm.handleSubmit(onUpdate)
          }
          className="space-y-4 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{labels.firstName}</label>
              <input
                {...(isCreate
                  ? createForm.register("firstName")
                  : editForm.register("firstName"))}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-destructive">
                {isCreate
                  ? createForm.formState.errors.firstName?.message
                  : editForm.formState.errors.firstName?.message}
              </p>
            </div>
            <div>
              <label className={labelClass}>{labels.lastName}</label>
              <input
                {...(isCreate
                  ? createForm.register("lastName")
                  : editForm.register("lastName"))}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-destructive">
                {isCreate
                  ? createForm.formState.errors.lastName?.message
                  : editForm.formState.errors.lastName?.message}
              </p>
            </div>
          </div>
          {isCreate && (
            <>
              <div>
                <label className={labelClass}>{labels.email}</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...createForm.register("email")}
                  className={fieldClass}
                />
                <p className="mt-1 text-xs text-destructive">
                  {createForm.formState.errors.email?.message}
                </p>
              </div>
              <div>
                <label className={labelClass}>{labels.password}</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...createForm.register("password")}
                  className={fieldClass}
                />
                <p className="mt-1 text-xs text-destructive">
                  {createForm.formState.errors.password?.message}
                </p>
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>{labels.role}</label>
            <select
              {...(isCreate
                ? createForm.register("role")
                : editForm.register("role"))}
              className={fieldClass}
            >
              <option value={AdminRoleEnum.ADMIN}>{labels.admin}</option>
              <option value={AdminRoleEnum.SUPER_ADMIN}>{labels.superAdmin}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {labels.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isCreate ? labels.create : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
