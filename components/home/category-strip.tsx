import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { CategoryRow } from "./category-row";

const layouts = [
  "lg:col-span-6",
  "lg:col-span-6",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4"
];

const themes: Record<
  string,
  {
    watermark: string;
    bgImage: string;
  }
> = {
  face: {
    watermark: "FACE",
    bgImage: "/assets/categories/cat-face.png"
  },
  lips: {
    watermark: "LIPS",
    bgImage: "/assets/categories/cat-lips.png"
  },
  skin: {
    watermark: "SKIN",
    bgImage: "/assets/categories/cat-skin.png"
  },
  eyes: {
    watermark: "EYES",
    bgImage: "/assets/categories/cat-eyes.png"
  },
  sets: {
    watermark: "SETS",
    bgImage: "/assets/categories/cat-sets.png"
  }
};

export function CategoryStrip({
  locale,
  categories,
  showIntro = true
}: {
  locale: "ar" | "en";
  categories: Array<{
    slug: string;
    imagePath: string | null;
    name: string;
    description: string;
  }>;
  showIntro?: boolean;
}) {
  return (
    <section className="page-section mt-14 lg:mt-16">
      <div className="section-container">
        {showIntro ? (
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <SectionHeading
                eyebrow={locale === "ar" ? "عالمكِ الخاص" : "Your Ritual"}
                title={
                  locale === "ar"
                    ? "مجموعات فاخرة تلبي كافة تطلعاتكِ"
                    : "Luxury collections tailored to your desires"
                }
                description={
                  locale === "ar"
                    ? "اكتشفي تشكيلاتنا المتنوعة، حيث يأخذكِ كل قسم في رحلة جمالية فريدة صُممت بعناية لتبرز جاذبيتكِ بأرقى المستحضرات."
                    : "Discover our diverse curations, where each section takes you on a unique beauty journey designed to enhance your allure with the finest cosmetics."
                }
              />
            </div>
          </Reveal>
        ) : null}

        <div className="mt-8 flex flex-col border-t border-black/10">
          {categories.map((category, index) => {
            const theme = themes[category.slug] ?? themes.face;

            return (
              <Reveal
                key={category.slug}
                delay={index * 0.05}
                className="w-full relative block"
              >
                <CategoryRow
                  category={category}
                  index={index}
                  locale={locale}
                  theme={theme}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
