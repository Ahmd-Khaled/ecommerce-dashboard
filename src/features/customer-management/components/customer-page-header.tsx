import { Users } from "lucide-react";

type Props = { title: string; subtitle: string; total: number; totalLabel: string };

export function CustomerPageHeader({ title, subtitle, total, totalLabel }: Props) {
  return (
    <>
      <header>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </header>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{totalLabel}</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>
      </section>
    </>
  );
}
