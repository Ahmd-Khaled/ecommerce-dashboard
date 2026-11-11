import { Search } from "lucide-react";
import type { CustomerRole, CustomerStatus } from "../types/customer.types";

type Props = {
  search: string; onSearchChange: (value: string) => void;
  role: CustomerRole | "all"; onRoleChange: (value: CustomerRole | "all") => void;
  status: CustomerStatus | "all"; onStatusChange: (value: CustomerStatus | "all") => void;
  isArabic: boolean;
  labels: { search: string; allRoles: string; allStatuses: string; user: string; guest: string; active: string; pending: string; frozen: string; deleted: string };
};

export function CustomerFilters({ search, onSearchChange, role, onRoleChange, status, onStatusChange, isArabic, labels }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row">
      <div className="relative flex-1">
        <Search className={`absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={labels.search} className={`h-10 w-full rounded-xl border border-input bg-background text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${isArabic ? "pr-9 pl-3" : "pl-9 pr-3"}`} />
      </div>
      <select value={role} onChange={(event) => onRoleChange(event.target.value as CustomerRole | "all")} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary">
        <option value="all">{labels.allRoles}</option><option value="user">{labels.user}</option><option value="guest">{labels.guest}</option>
      </select>
      <select value={status} onChange={(event) => onStatusChange(event.target.value as CustomerStatus | "all")} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary">
        <option value="all">{labels.allStatuses}</option><option value="active">{labels.active}</option><option value="pending">{labels.pending}</option><option value="frozen">{labels.frozen}</option><option value="deleted">{labels.deleted}</option>
      </select>
    </div>
  );
}
