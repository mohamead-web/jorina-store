import type { Metadata } from "next";

import { MobileShopFilters } from "@/components/shop/mobile-shop-filters";
import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getWishlistIds } from "@/lib/services/wishlist";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";

  return buildMetadata({
    locale: typedLocale,
    pathname: `/${typedLocale}/shop`,
    title: typedLocale === "ar" ? "جميع المنتجات" : "All products",
    description:
      typedLocale === "ar"
        ? "تصفحي جميع منتجات JORINA ضمن تجربة متجر هادئة ومصممة لتبرز المنتج أولًا."
        : "Browse all JORINA products in a calm, product-led luxury catalogue."
  });
}

export default async function ShopPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "featured" | "newest" | "priceAsc" | "priceDesc";
  }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const filters = await searchParams;
  const user = await getCurrentUser();
  const [products, categories, favoriteIds] = await Promise.all([
    getProducts(typedLocale, {
      query: filters.q,
      category: filters.category,
      sort: filters.sort
    }),
    getCategories(typedLocale),
    getWishlistIds(user?.id)
  ]);

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "المتجر" : "Shop"}
            title={typedLocale === "ar" ? "جميع المنتجات" : "All products"}
            description={
              typedLocale === "ar"
                ? "تصفح هادئ ومنسق ليبقى المنتج هو بطل المشهد."
                : "A calm catalogue designed to keep the product at the center."
            }
          />
        </Reveal>

        <MobileShopFilters
          locale={typedLocale}
          categories={categories}
          initialFilters={filters}
        />

        <Reveal delay={0.06}>
          <form className="premium-card mt-8 hidden gap-3 p-4 lg:grid lg:grid-cols-[1fr_220px_180px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={filters.q}
              placeholder={typedLocale === "ar" ? "ابحثي عن منتج" : "Search for a product"}
              className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-sm"
            />
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-sm"
            >
              <option value="">{typedLocale === "ar" ? "كل الفئات" : "All categories"}</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={filters.sort ?? "featured"}
              className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-sm"
            >
              <option value="featured">{typedLocale === "ar" ? "الأبرز" : "Featured"}</option>
              <option value="newest">{typedLocale === "ar" ? "الأحدث" : "Newest"}</option>
              <option value="priceAsc">
                {typedLocale === "ar" ? "السعر: الأقل أولًا" : "Price: low to high"}
              </option>
              <option value="priceDesc">
                {typedLocale === "ar" ? "السعر: الأعلى أولًا" : "Price: high to low"}
              </option>
            </select>
            <button className="h-12 rounded-full bg-text px-5 text-sm text-white">
              {typedLocale === "ar" ? "تطبيق" : "Apply"}
            </button>
          </form>
        </Reveal>

        <div className="mt-6 lg:mt-8">
          <ProductGrid locale={typedLocale} products={products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
