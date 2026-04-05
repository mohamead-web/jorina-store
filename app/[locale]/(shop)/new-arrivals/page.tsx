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
    pathname: `/${typedLocale}/new-arrivals`,
    title: typedLocale === "ar" ? "وصل حديثًا" : "New arrivals",
    description:
      typedLocale === "ar"
        ? "أحدث إصدارات JORINA بدرجات وصيغ جديدة تحافظ على الطابع الهادئ والفخم."
        : "Discover the latest JORINA releases in refined tones and composed formulas."
  });
}

export default async function NewArrivalsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const [products, favoriteIds] = await Promise.all([
    getCollectionProducts(typedLocale, "new-arrivals"),
    getWishlistIds(user?.id)
  ]);

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "وصل حديثًا" : "New arrivals"}
            title={typedLocale === "ar" ? "إصدارات JORINA الجديدة" : "The latest from JORINA"}
          />
        </Reveal>
        <div className="mt-8">
          <ProductGrid locale={typedLocale} products={products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
