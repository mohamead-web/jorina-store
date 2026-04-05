import { Reveal } from "@/components/ui/reveal";
import { testimonials } from "@/lib/constants/marketing";

export function TestimonialStrip({ locale }: { locale: "ar" | "en" }) {
  return (
    <section className="page-section mt-14 lg:mt-16">
      <div className="section-container grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        {testimonials.map((entry, index) => {
          const copy = entry[locale];

          return (
            <Reveal key={index} delay={index * 0.08}>
              <div className="premium-card relative overflow-hidden px-6 py-7 sm:px-7">
                <p className="pointer-events-none absolute end-6 top-3 font-display text-7xl leading-none text-black/[0.05]">
                  &ldquo;
                </p>
                <p className="max-w-xl font-display text-3xl leading-[1.4] text-text sm:text-[2.35rem]">
                  {copy.quote}
                </p>
                <div className="mt-7 border-t border-black/6 pt-5">
                  <p className="text-sm font-medium text-text">{copy.author}</p>
                  <p className="mt-1 text-sm text-text-soft">{copy.role}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
