"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import { ExternalLink, Eye, ImageIcon, Monitor, RefreshCw, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHomepagePreview } from "../hooks/use-homepage-preview";
import type { HomepageProduct } from "../types/homepage.types";

function ProductPreview({ product, currency, locale, isArabic, currencyExponent }: {
  product: HomepageProduct;
  currency: string;
  locale: string;
  isArabic: boolean;
  currencyExponent: number;
}) {
  const price = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency", currency, minimumFractionDigits: currencyExponent,
    maximumFractionDigits: currencyExponent,
  }).format(product.price);
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border bg-background">
      {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} width={320} height={240} unoptimized className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><ImageIcon className="size-8 text-muted-foreground" /></div>}
      <div className="space-y-1 p-3"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-sm font-semibold">{price}</p>{product.compareAtPrice && product.compareAtPrice > product.price ? <p className="text-xs text-muted-foreground line-through">{new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", { style: "currency", currency, minimumFractionDigits: currencyExponent, maximumFractionDigits: currencyExponent }).format(product.compareAtPrice)}</p> : null}<p className="text-xs text-muted-foreground">{isArabic ? "المخزون" : "Stock"}: {product.stock}</p></div>
    </div>
  );
}

export function HomepagePreviewPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const query = useHomepagePreview(view, locale);
  const data = query.data;
  const text = {
    title: isArabic ? "معاينة الصفحة الرئيسية" : "Homepage preview",
    subtitle: isArabic ? "معاينة المحتوى الذي تعرضه واجهة المتجر حالياً." : "Preview the content currently returned by the storefront homepage API.",
    desktop: isArabic ? "سطح المكتب" : "Desktop",
    mobile: isArabic ? "الهاتف" : "Mobile",
    refresh: isArabic ? "تحديث" : "Refresh",
    manageBanners: isArabic ? "إدارة البنرات" : "Manage banners",
    readOnly: isArabic ? "معاينة فقط" : "Preview only",
    readOnlyDescription: isArabic ? "تُنشأ أقسام المنتجات تلقائياً بواسطة الباك إند. لا توجد حالياً واجهات لإدارة ترتيب الأقسام أو اختيار المنتجات يدوياً أو إخفائها." : "Product sections are generated automatically by the backend. There are currently no APIs for manually selecting products, hiding sections, or changing their order.",
    banners: isArabic ? "البنرات" : "Banners",
    categories: isArabic ? "التصنيفات" : "Categories",
    latest: isArabic ? "أحدث المنتجات" : "Latest products",
    offers: isArabic ? "أفضل العروض" : "Best offers",
    deal: isArabic ? "أفضل صفقة" : "Best deal",
    sellers: isArabic ? "الأكثر مبيعاً" : "Best sellers",
    noItems: isArabic ? "لا توجد عناصر لهذا القسم." : "No items are currently returned for this section.",
    loading: isArabic ? "جارٍ تحميل المعاينة..." : "Loading homepage preview...",
    error: isArabic ? "تعذر تحميل معاينة الصفحة الرئيسية." : "Unable to load homepage preview.",
  };

  function sectionTitle(title: string, count: number) {
    return <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-base font-semibold">{title}</h3><span className="text-xs text-muted-foreground">{count}</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{text.title}</h1><Badge variant="outline"><Eye className="me-1 size-3" />{text.readOnly}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{text.subtitle}</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={`me-2 size-4 ${query.isFetching ? "animate-spin" : ""}`} />{text.refresh}</Button><Button asChild><Link href={`/${locale}/banners`}>{text.manageBanners}<ExternalLink className="ms-2 size-4" /></Link></Button></div>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-start gap-3 p-4"><Eye className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">{text.readOnly}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{text.readOnlyDescription}</p></div></CardContent>
      </Card>

      <div className="flex gap-2"><Button variant={view === "desktop" ? "default" : "outline"} onClick={() => setView("desktop")}><Monitor className="me-2 size-4" />{text.desktop}</Button><Button variant={view === "mobile" ? "default" : "outline"} onClick={() => setView("mobile")}><Smartphone className="me-2 size-4" />{text.mobile}</Button></div>

      {query.isPending ? <div className="py-16 text-center text-sm text-muted-foreground">{text.loading}</div> : null}
      {query.isError ? <Card><CardContent className="py-12 text-center text-sm text-destructive">{text.error}<div className="mt-3"><Button size="sm" variant="outline" onClick={() => void query.refetch()}>{text.refresh}</Button></div></CardContent></Card> : null}

      {data ? (
        <div className={view === "mobile" ? "mx-auto max-w-[420px] rounded-[2rem] border-[8px] border-slate-800 bg-background p-3 shadow-xl" : "rounded-2xl border bg-background p-5"}>
          <div className="mb-4 flex items-center justify-between border-b pb-3"><div className="font-bold tracking-wide">{isArabic ? "المتجر" : "ONLINE STORE"}</div><span className="text-xs text-muted-foreground">{data.currency}</span></div>

          <section className="mb-7">
            {sectionTitle(text.banners, data.banners.length)}
            {data.banners.length ? <div className={view === "mobile" ? "space-y-3" : "grid gap-3 md:grid-cols-2"}>{data.banners.map((banner) => <div key={banner._id} className="overflow-hidden rounded-xl border"><Image src={banner.image} alt={banner.altText || banner.title || "Store banner"} width={1200} height={480} unoptimized className="aspect-[16/6] w-full object-cover" />{banner.title ? <p className="p-2 text-sm font-medium">{banner.title}</p> : null}</div>)}</div> : <p className="text-sm text-muted-foreground">{text.noItems}</p>}
          </section>

          <section className="mb-7">
            {sectionTitle(text.categories, data.categories.length)}
            {data.categories.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{data.categories.map((category) => <div key={category._id} className="min-w-0 text-center">{category.image ? <Image src={category.image} alt={category.name} width={160} height={120} unoptimized className="aspect-square w-full rounded-xl object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-xl bg-muted"><ImageIcon className="size-6 text-muted-foreground" /></div>}<p className="mt-2 truncate text-xs font-medium">{category.name}</p></div>)}</div> : <p className="text-sm text-muted-foreground">{text.noItems}</p>}
          </section>

          {[{ title: text.latest, products: data.latestProducts }, { title: text.offers, products: data.bestOffers }, { title: text.sellers, products: data.bestSellers }].map((section) => (
            <section key={section.title} className="mb-7">{sectionTitle(section.title, section.products.length)}{section.products.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{section.products.map((product) => <ProductPreview key={`${section.title}-${product._id}`} product={product} currency={data.currency} locale={locale} isArabic={isArabic} currencyExponent={data.currencyExponent} />)}</div> : <p className="text-sm text-muted-foreground">{text.noItems}</p>}</section>
          ))}

          {data.bestDeal ? <section className="mb-2">{sectionTitle(text.deal, 1)}<div className="max-w-xs"><ProductPreview product={data.bestDeal} currency={data.currency} locale={locale} isArabic={isArabic} currencyExponent={data.currencyExponent} /></div></section> : null}
        </div>
      ) : null}
    </div>
  );
}
