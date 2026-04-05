import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";

  return (
    <div className="page-section py-12">
      <div className="section-container premium-card px-6 py-8 lg:px-10 lg:py-12">
        <Reveal>
          <SectionHeading
            eyebrow={ar ? "عن JORINA" : "About JORINA"}
            title={ar ? "علامة تجميل هادئة بلمسة تحريرية" : "A quiet beauty house with an editorial edge"}
            description={
              ar
                ? "JORINA تبني تجربة تجميل حديثة تقوم على الوضوح، المساحة، والمنتج المصمم بعناية."
                : "JORINA builds a modern beauty experience around clarity, space and carefully considered product design."
            }
          />
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="rounded-[1.5rem] border border-border bg-white p-5">
              <h2 className="font-display text-3xl text-text">{ar ? "الفلسفة" : "Philosophy"}</h2>
              <p className="mt-4 text-sm leading-8 text-text-soft">
                {ar
                  ? "نؤمن أن الفخامة لا تحتاج إلى ضجيج بصري. لذلك تأتي تجربتنا ناعمة، واضحة، ومركزة على الجودة والملمس والوظيفة."
                  : "We believe luxury does not require visual noise. Our approach stays soft, clear and grounded in texture, quality and purpose."}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[1.5rem] border border-border bg-white p-5">
              <h2 className="font-display text-3xl text-text">{ar ? "التجربة" : "Experience"}</h2>
              <p className="mt-4 text-sm leading-8 text-text-soft">
                {ar
                  ? "صممت الواجهة عربيًا أولًا لتكون مريحة على الهاتف ومصقولة على الأجهزة الأكبر، مع استعداد للتوسع إلى لغات ودول إضافية."
                  : "The interface is designed Arabic-first for comfort on mobile and polish on larger screens, while staying ready for future markets and languages."}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
