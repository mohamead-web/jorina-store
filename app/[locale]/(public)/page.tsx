import type { Metadata } from "next";

import { BrandStatement } from "@/components/home/brand-statement";
import { CategoryStrip } from "@/components/home/category-strip";
import { CollectionSection } from "@/components/home/collection-section";
import { HeroSection } from "@/components/home/hero-section";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { TestimonialStrip } from "@/components/home/testimonial-strip";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo/metadata";
import { getHomepageData } from "@/lib/services/catalog";
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
    pathname: `/${typedLocale}`,
    title:
      typedLocale === "ar"
        ? "تجربة تجميل فاخرة وهادئة"
        : "A calm luxury cosmetics experience",
    description:
      typedLocale === "ar"
        ? "متجر JORINA يقدم تجربة تجميل عربية أولًا بطابع فاخر، هادئ، ومصقول عبر منتجات مختارة بعناية."
        : "JORINA delivers an Arabic-first luxury cosmetics experience with refined product edits and a polished editorial mood."
  });
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const [user, homepage] = await Promise.all([
    getCurrentUser(),
    getHomepageData(typedLocale)
  ]);
  const favoriteIds = await getWishlistIds(user?.id);

  return (
    <>
      <HeroSection locale={typedLocale} />
      <CategoryStrip locale={typedLocale} categories={homepage.categories} />
      <CollectionSection
        locale={typedLocale}
        eyebrow={typedLocale === "ar" ? "مختارات JORINA" : "JORINA's Edit"}
        title={
          typedLocale === "ar"
            ? "أساسيات إطلالتك الساحرة"
            : "Essentials for a magical look"
        }
        description={
          typedLocale === "ar"
            ? "تشكيلة استثنائية من أرقى المستحضرات لروتين عناية يومي لا يضاهى."
            : "An exceptional curation of premium cosmetics for an unparalleled daily beauty ritual."
        }
        href="/shop"
        products={homepage.featured}
        favoriteIds={favoriteIds}
      />
      <CollectionSection
        locale={typedLocale}
        eyebrow={typedLocale === "ar" ? "الأكثر مبيعًا" : "Best sellers"}
        title={
          typedLocale === "ar"
            ? "الأيقونات التي تتألق بها كل امرأة"
            : "Icons every woman shines with"
        }
        description={
          typedLocale === "ar"
            ? "المستحضرات الأكثر طلباً، والتي أثبتت تميزها في منحك النتيجة المثالية."
            : "Our most coveted cosmetics, proven to deliver the perfect flawless finish."
        }
        href="/best-sellers"
        products={homepage.bestSellers}
        favoriteIds={favoriteIds}
      />
      <CollectionSection
        locale={typedLocale}
        eyebrow={typedLocale === "ar" ? "الجديد الآن" : "New arrivals"}
        title={
          typedLocale === "ar"
            ? "أحدث إبداعاتنا التجميلية لتألق دائم"
            : "Our latest beauty creations for lasting radiance"
        }
        description={
          typedLocale === "ar"
            ? "اكتشفي أحدث الإضافات لمجموعتنا، ابتكارات تجمع نقاء المكونات وسحر الألوان."
            : "Discover the newest additions to our collection, bridging pure ingredients and captivating colors."
        }
        href="/new-arrivals"
        products={homepage.newArrivals}
        favoriteIds={favoriteIds}
      />
      <BrandStatement locale={typedLocale} />
      <TestimonialStrip locale={typedLocale} />
      <NewsletterCta locale={typedLocale} />
    </>
  );
}
