import { faqEntries } from "@/lib/constants/marketing";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function FaqPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  return (
    <div className="page-section py-12">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={ar ? "مساعدة" : "Help"}
            title={ar ? "أسئلة شائعة" : "Frequently asked questions"}
          />
        </Reveal>
        <div className="mt-8 grid gap-4">
          {faqEntries.map((entry, index) => {
            const copy = entry[ar ? "ar" : "en"];

            return (
              <Reveal key={index} delay={index * 0.05}>
                <div className="premium-card px-5 py-5">
                  <h3 className="font-display text-2xl text-text">{copy.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-soft">{copy.answer}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
