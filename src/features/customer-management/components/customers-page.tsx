"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CustomerDeleteDialog } from "./customer-delete-dialog";
import { CustomerDialog } from "./customer-dialog";
import { CustomerFilters } from "./customer-filters";
import { CustomerPageHeader } from "./customer-page-header";
import { CustomerTable } from "./customer-table";
import { useCustomerList, useDeleteCustomer, useUpdateCustomer } from "../hooks/use-customer-management";
import type { UpdateCustomerFormValues } from "../schemas/customer.schema";
import type { Customer, CustomerRole, CustomerStatus } from "../types/customer.types";

const PAGE_SIZE = 10;
type DialogMode = "view" | "edit" | null;

export default function CustomersPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("CustomerManagement");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<CustomerRole | "all">("all");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const params = useMemo(() => ({ page, limit: PAGE_SIZE, ...(search.trim() ? { search: search.trim() } : {}), ...(role !== "all" ? { role } : {}), ...(status !== "all" ? { status } : {}) }), [page, search, role, status]);
  const customersQuery = useCustomerList(params);
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const customers = customersQuery.data?.users ?? [];
  const pagination = customersQuery.data?.pagination;
  const labels = {
    search: t("search"), allRoles: t("allRoles"), allStatuses: t("allStatuses"), user: t("roles.user"), guest: t("roles.guest"),
    active: t("statuses.active"), pending: t("statuses.pending"), frozen: t("statuses.frozen"), deleted: t("statuses.deleted"),
    customer: t("customer"), role: t("role"), status: t("status"), created: t("created"), actions: t("actions"),
    view: t("view"), edit: t("edit"), freeze: t("freeze"), unfreeze: t("unfreeze"), delete: t("delete"),
    loading: t("loading"), noResults: t("noResults"), page: t("page"), of: t("of"), previous: t("previous"), next: t("next"),
  };

  function openDialog(mode: Exclude<DialogMode, null>, customer: Customer) {
    setSelectedCustomer(customer);
    setDialogMode(mode);
  }
  function closeDialog() {
    setSelectedCustomer(null);
    setDialogMode(null);
  }
  function handleStatusChange(customer: Customer) {
    if (customer.status === "deleted" || customer.status === "pending") return;
    void updateMutation.mutateAsync({ id: customer.id, payload: { status: customer.status === "active" ? "frozen" : "active" } });
  }
  async function handleUpdate(values: UpdateCustomerFormValues) {
    if (!selectedCustomer) return;
    await updateMutation.mutateAsync({ id: selectedCustomer.id, payload: values });
    closeDialog();
  }
  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return <div className="space-y-6">
    <CustomerPageHeader title={t("title")} subtitle={t("subtitle")} total={pagination?.total ?? 0} totalLabel={t("total")} />
    <CustomerFilters search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} role={role} onRoleChange={(value) => { setRole(value); setPage(1); }} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} isArabic={isArabic} labels={labels} />
    <CustomerTable customers={customers} isLoading={customersQuery.isLoading} isFetching={customersQuery.isFetching} page={pagination?.page ?? page} totalPages={pagination?.totalPages ?? 1} locale={locale} isArabic={isArabic} labels={labels} onPageChange={setPage} onView={(customer) => openDialog("view", customer)} onEdit={(customer) => openDialog("edit", customer)} onStatusChange={handleStatusChange} onDelete={setDeleteTarget} isUpdating={updateMutation.isPending} />
    {dialogMode && selectedCustomer && <CustomerDialog customer={selectedCustomer} mode={dialogMode} isPending={updateMutation.isPending} onClose={closeDialog} onUpdate={handleUpdate} />}
    {deleteTarget && <CustomerDeleteDialog customer={deleteTarget} isPending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onDelete={() => void handleDelete()} />}
  </div>;
}
