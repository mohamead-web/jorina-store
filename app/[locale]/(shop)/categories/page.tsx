import type { Metadata } from "next";

import { CategoryStrip } from "@/components/home/category-strip";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategories } from "@/lib/services/catalog";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";

  return buildMetadata({
    locale: typedLocale,
    pathname: `/${typedLocale}/categories`,
    title: typedLocale === "ar" ? "الفئات" : "Categories",
    description:
      typedLocale === "ar"
        ? "استكشفي فئات JORINA المنظمة بين الوجه، الشفاه، العناية، العيون والمجموعات."
        : "Explore JORINA categories across complexion, lips, skincare, eyes and curated sets."
  });
}

export default async function CategoriesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const categories = await getCategories(typedLocale);

  return (
    <div className="py-10">
      <div className="page-section">
        <div className="section-container">
          <Reveal>
            <SectionHeading
              eyebrow={typedLocale === "ar" ? "الفئات" : "Categories"}
              title={
                typedLocale === "ar"
                  ? "اختاري طريقك داخل JORINA"
                  : "Choose your path into JORINA"
              }
              description={
                typedLocale === "ar"
                  ? "كل فئة مصممة لتقدم لك تصفحًا مركزًا وهادئًا."
                  : "Each category is designed to create a focused, calm browsing experience."
              }
            />
          </Reveal>
        </div>
      </div>
      <CategoryStrip locale={typedLocale} categories={categories} showIntro={false} />
    </div>
  );
}
