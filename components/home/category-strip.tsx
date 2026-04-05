import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

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
                <Link
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 py-12 px-6 sm:px-10 transition-all duration-700 hover:border-transparent"
                >
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[#fbf9f8]">
                    <img src={theme.bgImage} alt="" className="w-full h-full object-cover opacity-35 mix-blend-multiply" />
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-6 sm:gap-16 w-full md:w-auto">
                    <span className="text-sm font-ui opacity-40 group-hover:opacity-70 transition-opacity text-text group-hover:text-[#2a1a14]">
                      {`0${index + 1}`}
                    </span>
                    <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] tracking-tight uppercase group-hover:pl-6 transition-all duration-700 text-text group-hover:text-[#2a1a14]">
                      {category.name}
                    </h3>
                  </div>
                  
                  <div className="relative z-10 mt-8 md:mt-0 max-w-sm flex flex-col items-start md:items-end text-left md:text-right">
                     <p className="text-sm sm:text-base font-light font-ui leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity text-text group-hover:text-[#2a1a14]">
                        {category.description}
                     </p>
                     <span className="mt-6 inline-flex items-center text-[10px] uppercase tracking-[0.3em] font-bold border-b border-black/20 group-hover:border-[#2a1a14]/40 text-text group-hover:text-[#2a1a14] pb-1 transition-colors duration-500">
                        {locale === "ar" ? "استكشفي الفئة" : "View category"}
                     </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
