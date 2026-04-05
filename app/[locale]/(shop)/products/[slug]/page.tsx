import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductBuyBox } from "@/components/product/product-buybox";
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { getProductBySlug } from "@/lib/services/catalog";
import { getWishlistIds } from "@/lib/services/wishlist";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const data = await getProductBySlug(typedLocale, slug);

  if (!data) {
    return buildMetadata({
      locale: typedLocale,
      pathname: `/${typedLocale}/products/${slug}`,
      title: typedLocale === "ar" ? "المنتج غير موجود" : "Product not found",
      description:
        typedLocale === "ar"
          ? "تعذر العثور على المنتج المطلوب ضمن مجموعة JORINA."
          : "The requested product could not be found in the JORINA collection."
    });
  }

  return buildMetadata({
    locale: typedLocale,
    pathname: `/${typedLocale}/products/${slug}`,
    title: data.product.name,
    description: data.product.shortDescription
  });
}

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const [data, favoriteIds] = await Promise.all([
    getProductBySlug(typedLocale, slug),
    getWishlistIds(user?.id)
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="page-section pb-[calc(env(safe-area-inset-bottom,0px)+7.5rem)] pt-8 lg:pb-10 lg:pt-10">
      <div className="section-container grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Reveal distance={32}>
          <ProductGallery images={data.product.images} title={data.product.name} />
        </Reveal>
        <Reveal delay={0.08} distance={32}>
          <ProductBuyBox
            locale={typedLocale}
            product={data.product}
            isFavorite={favoriteIds.has(data.product.id)}
          />
        </Reveal>
      </div>

      <div className="page-section mt-14 px-0">
        <div className="section-container">
          <Reveal>
            <SectionHeading
              eyebrow={typedLocale === "ar" ? "تفاصيل المنتج" : "Product details"}
              title={
                typedLocale === "ar"
                  ? "الوصف، المكونات، وطريقة الاستخدام"
                  : "Description, ingredients and usage"
              }
            />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="mt-8">
              <ProductDetailsTabs
                locale={typedLocale}
                description={data.product.longDescription}
                ingredients={data.product.ingredients}
                howToUse={data.product.howToUse}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="page-section mt-14 px-0">
        <div className="section-container">
          <Reveal>
            <SectionHeading
              eyebrow={typedLocale === "ar" ? "اقتراحات" : "You may also like"}
              title={typedLocale === "ar" ? "منتجات مرتبطة" : "Related products"}
            />
          </Reveal>
          <div className="mt-8">
            <ProductGrid
              locale={typedLocale}
              products={data.relatedProducts}
              favoriteIds={favoriteIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
