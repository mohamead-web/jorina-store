import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { getProducts } from "@/lib/services/catalog";
import { getWishlistIds } from "@/lib/services/wishlist";

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const { q } = await searchParams;
  const user = await getCurrentUser();
  const [products, favoriteIds] = await Promise.all([
    getProducts(typedLocale, { query: q }),
    getWishlistIds(user?.id)
  ]);

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "البحث" : "Search"}
            title={typedLocale === "ar" ? "ابحثي داخل المجموعة" : "Search within the collection"}
          />
        </Reveal>
        <Reveal delay={0.06}>
          <form className="premium-card mt-8 flex flex-col gap-3 p-4 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={typedLocale === "ar" ? "ابحثي عن منتج أو فئة" : "Search for a product or category"}
              className="h-12 flex-1 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base sm:text-sm"
            />
            <button className="h-12 rounded-full bg-text px-5 text-sm text-white sm:min-w-32">
              {typedLocale === "ar" ? "بحث" : "Search"}
            </button>
          </form>
        </Reveal>
        <div className="mt-8">
          <ProductGrid locale={typedLocale} products={products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
