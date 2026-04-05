import { Reveal } from "@/components/ui/reveal";
import { valueProps } from "@/lib/constants/marketing";

export function BrandStatement({ locale }: { locale: "ar" | "en" }) {
  return (
    <section className="page-section mt-14 lg:mt-16">
      <div className="section-container overflow-hidden rounded-[2.4rem] bg-[#231F1C] px-6 py-8 text-white shadow-[0_60px_120px_-82px_rgba(0,0,0,0.65)] lg:px-10 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <Reveal>
            <div className="max-w-xl">
              <p className="section-kicker text-white/45">
                {locale === "ar" ? "قيم التجربة" : "Why JORINA"}
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-[3.65rem]">
                {locale === "ar"
                  ? "فخامة حقيقية تنبض في كل قطرة"
                  : "True luxury in every drop"}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/72 sm:text-base">
                {locale === "ar"
                  ? "نؤمن أن المستحضرات الراقية لا تحتاج إلى ضجيج. كل تركيبة في JORINA صُممت بعناية فائقة لتنساب بنعومة، وتندمج بسلاسة لتعكس جمالكِ الطبيعي."
                  : "We believe premium cosmetics need no noise. Every JORINA formula is meticulously crafted to glide softly and blend seamlessly, reflecting your natural beauty."}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5">
            {valueProps.map((item, index) => {
              const copy = item[locale];

              return (
                <Reveal key={copy.title} delay={index * 0.06}>
                  <div className="grid gap-4 border-t border-white/10 py-5 sm:grid-cols-[88px_1fr] sm:items-start">
                    <p className="font-display text-4xl text-white/22">{`0${index + 1}`}</p>
                    <div>
                      <h3 className="font-display text-3xl text-white">{copy.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                        {copy.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
