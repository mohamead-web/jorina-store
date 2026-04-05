import type { Metadata } from "next";

import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCollectionProducts } from "@/lib/services/catalog";
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
    pathname: `/${typedLocale}/best-sellers`,
    title: typedLocale === "ar" ? "الأكثر مبيعًا" : "Best sellers",
    description:
      typedLocale === "ar"
        ? "المنتجات التي حازت على ثقة العملاء ضمن أكثر اختيارات JORINA طلبًا."
        : "The JORINA products customers return to most across the collection."
  });
}

export default async function BestSellersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const [products, favoriteIds] = await Promise.all([
    getCollectionProducts(typedLocale, "best-sellers"),
    getWishlistIds(user?.id)
  ]);

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "الأكثر مبيعًا" : "Best sellers"}
            title={
              typedLocale === "ar"
                ? "منتجات تحظى بثقة متكررة"
                : "Products with repeat confidence"
            }
          />
        </Reveal>
        <div className="mt-8">
          <ProductGrid locale={typedLocale} products={products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
