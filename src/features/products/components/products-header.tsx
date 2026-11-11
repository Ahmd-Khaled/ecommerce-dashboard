import Link from "next/link";
import { Package, Plus } from "lucide-react";

type Props = { title: string; subtitle: string; addProduct: string };

export function ProductsHeader({ title, subtitle, addProduct }: Props) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Package className="size-4" />{title}</div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Link href="products/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="size-4" />{addProduct}</Link>
    </header>
  );
}
