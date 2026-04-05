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
    pathname: `/${typedLocale}/offers`,
    title: typedLocale === "ar" ? "العروض" : "Offers",
    description:
      typedLocale === "ar"
        ? "عروض JORINA المختارة على المنتجات الأساسية والمجموعات دون ازدحام بصري."
        : "Selected JORINA offers across essentials and curated sets without visual clutter."
  });
}

export default async function OffersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const [products, favoriteIds] = await Promise.all([
    getCollectionProducts(typedLocale, "offers"),
    getWishlistIds(user?.id)
  ]);

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "العروض" : "Offers"}
            title={typedLocale === "ar" ? "عروض هادئة ومختارة" : "Quietly curated offers"}
          />
        </Reveal>
        <div className="mt-8">
          <ProductGrid locale={typedLocale} products={products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
