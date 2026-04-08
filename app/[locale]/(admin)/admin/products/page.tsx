import Image from "next/image";
import Form from "next/form";
import { Plus, Search } from "lucide-react";

import { ProductArchiveButton } from "@/components/admin/product-archive-button";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getAdminProducts } from "@/lib/services/admin-products";
import { formatCurrency } from "@/lib/utils";

const allowedStatuses = new Set(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"]);

const statusStyles = {
  DRAFT: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  ACTIVE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  ARCHIVED: "border-white/10 bg-white/10 text-white/65"
} as const;

const statusLabels = {
  DRAFT: { ar: "مسودة", en: "Draft" },
  ACTIVE: { ar: "نشط", en: "Active" },
  ARCHIVED: { ar: "مؤرشف", en: "Archived" }
} as const;

export default async function AdminProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const { q, status } = await searchParams;
  const selectedStatus =
    status && allowedStatuses.has(status) ? (status as "ALL" | "DRAFT" | "ACTIVE" | "ARCHIVED") : "ALL";
  const products = await getAdminProducts({
    locale: typedLocale,
    query: q?.trim() || undefined,
    status: selectedStatus
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-300/70">
            {typedLocale === "ar" ? "كتالوج الأدمن" : "Admin catalogue"}
          </p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            {typedLocale === "ar" ? "إدارة المنتجات" : "Manage products"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            {typedLocale === "ar"
              ? "ابحثي، راجعي الحالة، وادخلي مباشرة إلى شاشة التعديل أو الإضافة."
              : "Search, review status, and jump directly into editing or creating products."}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {typedLocale === "ar" ? "إضافة منتج" : "Add product"}
          </Link>
        </Button>
      </div>

      <Form
        action={`/${typedLocale}/admin/products`}
        className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[1fr_220px_auto]"
      >
        <label className="relative block">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={
              typedLocale === "ar"
                ? "ابحثي بالاسم أو السلاج أو SKU"
                : "Search by name, slug, or SKU"
            }
            className="h-12 w-full rounded-[1.15rem] border border-white/10 bg-black/20 px-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </label>
        <select
          name="status"
          defaultValue={selectedStatus}
          className="h-12 rounded-[1.15rem] border border-white/10 bg-black/20 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
        >
          <option value="ALL" className="bg-[#151515]">
            {typedLocale === "ar" ? "كل الحالات" : "All statuses"}
          </option>
          <option value="DRAFT" className="bg-[#151515]">
            {typedLocale === "ar" ? "مسودة" : "Draft"}
          </option>
          <option value="ACTIVE" className="bg-[#151515]">
            {typedLocale === "ar" ? "نشط" : "Active"}
          </option>
          <option value="ARCHIVED" className="bg-[#151515]">
            {typedLocale === "ar" ? "مؤرشف" : "Archived"}
          </option>
        </select>
        <Button type="submit" className="w-full sm:w-auto">
          {typedLocale === "ar" ? "تطبيق" : "Apply"}
        </Button>
      </Form>

      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-sm text-white/45 sm:px-6">
          <span>
            {typedLocale === "ar"
              ? `${products.length} منتج`
              : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </span>
          <span>{typedLocale === "ar" ? "الأسعار بالأساس EGP" : "Base pricing shown in EGP"}</span>
        </div>

        <div className="divide-y divide-white/8">
          {products.map((product) => (
            <div
              key={product.id}
              className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.6fr)_0.8fr_0.55fr_0.55fr_0.7fr]"
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.1rem] bg-white/5">
                  <Image
                    src={product.imagePath}
                    alt={product.localizedName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl text-white">
                      {product.localizedName}
                    </h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${statusStyles[product.status]}`}
                    >
                      {typedLocale === "ar"
                        ? statusLabels[product.status].ar
                        : statusLabels[product.status].en}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/55">AR: {product.nameAr}</p>
                  <p className="text-sm text-white/55">EN: {product.nameEn}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-white/25">
                    <span>{product.slug}</span>
                    <span>{product.sku}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "السعر" : "Price"}
                </p>
                <p className="text-lg font-medium text-white">
                  {formatCurrency(product.basePrice, typedLocale, "EGP")}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-white/35 line-through">
                    {formatCurrency(product.compareAtPrice, typedLocale, "EGP")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "المخزون" : "Stock"}
                </p>
                <p className="text-lg font-medium text-white">{product.totalStock}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "الـ variants" : "Variants"}
                </p>
                <p className="text-lg font-medium text-white">{product.variantCount}</p>
              </div>

              <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                <Button asChild variant="secondary">
                  <Link href={`/admin/products/${product.id}`}>
                    {typedLocale === "ar" ? "تعديل" : "Edit"}
                  </Link>
                </Button>
                {product.status !== "ARCHIVED" ? (
                  <ProductArchiveButton locale={typedLocale} productId={product.id} />
                ) : null}
              </div>
            </div>
          ))}

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-white/35">
              {typedLocale === "ar"
                ? "لا توجد منتجات تطابق الفلاتر الحالية."
                : "No products match the current filters."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
