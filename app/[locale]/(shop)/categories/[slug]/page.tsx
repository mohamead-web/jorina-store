import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategoryBySlug } from "@/lib/services/catalog";
import { getWishlistIds } from "@/lib/services/wishlist";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const category = await getCategoryBySlug(typedLocale, slug);

  return buildMetadata({
    locale: typedLocale,
    pathname: `/${typedLocale}/categories/${slug}`,
    title: category?.seoTitle ?? category?.name ?? (typedLocale === "ar" ? "الفئة" : "Category"),
    description:
      category?.seoDescription ??
      category?.description ??
      (typedLocale === "ar"
        ? "اكتشفي منتجات هذه الفئة ضمن تجربة JORINA الهادئة."
        : "Discover products in this category within the JORINA luxury experience.")
  });
}

export default async function CategoryDetailsPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const [category, favoriteIds] = await Promise.all([
    getCategoryBySlug(typedLocale, slug),
    getWishlistIds(user?.id)
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={typedLocale === "ar" ? "الفئة" : "Category"}
            title={category.name}
            description={category.description}
          />
        </Reveal>
        <div className="mt-8">
          <ProductGrid locale={typedLocale} products={category.products} favoriteIds={favoriteIds} />
        </div>
      </div>
    </div>
  );
}
