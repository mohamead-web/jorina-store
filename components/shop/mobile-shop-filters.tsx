"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

type ShopFilters = {
  q?: string;
  category?: string;
  sort?: "featured" | "newest" | "priceAsc" | "priceDesc";
};

export function MobileShopFilters({
  locale,
  categories,
  initialFilters
}: {
  locale: "ar" | "en";
  categories: Array<{ slug: string; name: string }>;
  initialFilters: ShopFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(initialFilters.q ?? "");
  const [category, setCategory] = useState(initialFilters.category ?? "");
  const [sort, setSort] = useState<NonNullable<ShopFilters["sort"]>>(
    initialFilters.sort ?? "featured"
  );

  const activeChips = useMemo(() => {
    const chips: string[] = [];

    if (query) {
      chips.push(query);
    }

    if (category) {
      const categoryName = categories.find((item) => item.slug === category)?.name;
      if (categoryName) {
        chips.push(categoryName);
      }
    }

    if (sort !== "featured") {
      chips.push(
        locale === "ar"
          ? sort === "newest"
            ? "الأحدث"
            : sort === "priceAsc"
              ? "الأقل سعرًا"
              : "الأعلى سعرًا"
          : sort === "newest"
            ? "Newest"
            : sort === "priceAsc"
              ? "Lowest price"
              : "Highest price"
      );
    }

    return chips;
  }, [categories, category, locale, query, sort]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (category) {
      params.set("category", category);
    }

    if (sort !== "featured") {
      params.set("sort", sort);
    }

    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
    setOpen(false);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setSort("featured");
    router.push(pathname);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="space-y-3 lg:hidden">
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="premium-card flex w-full items-center justify-between gap-4 px-4 py-4 text-start"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-background-soft text-text">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-text">
                  {locale === "ar" ? "بحث، فلترة وترتيب" : "Search, filter and sort"}
                </p>
                <p className="mt-1 text-xs leading-5 text-text-soft">
                  {activeChips.length > 0
                    ? activeChips.join(" • ")
                    : locale === "ar"
                      ? "افتحي لوحة الجوال السريعة للوصول للنتائج المناسبة"
                      : "Open the quick mobile sheet to refine the collection"}
                </p>
              </div>
            </div>
            <Search className="h-4 w-4 text-text-soft" />
          </button>
        </Dialog.Trigger>

        {activeChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-black/8 bg-white/80 px-3 py-1.5 text-xs text-text"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border border-black/8 bg-[linear-gradient(180deg,#fffdfc_0%,#f8f0ee_100%)] px-4 pb-6 pt-4 shadow-[0_-18px_45px_-24px_rgba(17,12,12,0.28)] outline-hidden"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
          data-lenis-prevent
        >
          <div className="mx-auto max-w-lg">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <Dialog.Title className="font-display text-3xl text-text">
                  {locale === "ar" ? "تنسيق المتجر" : "Refine the shop"}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-text-soft">
                  {locale === "ar"
                    ? "اختاري البحث والفئة والترتيب بشكل يناسب التصفح على الجوال."
                    : "Adjust search, category and sort in a mobile-friendly sheet."}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/80 text-text"
                  aria-label={locale === "ar" ? "إغلاق" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <label className="grid gap-2 text-sm text-text-soft">
                <span>{locale === "ar" ? "البحث" : "Search"}</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={locale === "ar" ? "ابحثي عن منتج" : "Search for a product"}
                  className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text sm:text-sm"
                />
              </label>

              <label className="grid gap-2 text-sm text-text-soft">
                <span>{locale === "ar" ? "الفئة" : "Category"}</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text sm:text-sm"
                >
                  <option value="">{locale === "ar" ? "كل الفئات" : "All categories"}</option>
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-text-soft">
                <span>{locale === "ar" ? "الترتيب" : "Sort by"}</span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as NonNullable<ShopFilters["sort"]>)
                  }
                  className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text sm:text-sm"
                >
                  <option value="featured">{locale === "ar" ? "الأبرز" : "Featured"}</option>
                  <option value="newest">{locale === "ar" ? "الأحدث" : "Newest"}</option>
                  <option value="priceAsc">
                    {locale === "ar" ? "السعر: الأقل أولًا" : "Price: low to high"}
                  </option>
                  <option value="priceDesc">
                    {locale === "ar" ? "السعر: الأعلى أولًا" : "Price: high to low"}
                  </option>
                </select>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                {locale === "ar" ? "إعادة الضبط" : "Reset"}
              </Button>
              <Button type="button" size="lg" className="w-full" onClick={applyFilters}>
                {locale === "ar" ? "عرض النتائج" : "Show results"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
