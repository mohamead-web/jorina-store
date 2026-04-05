import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function TermsPage({
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
            eyebrow={ar ? "الشروط والأحكام" : "Terms & conditions"}
            title={ar ? "استخدام واضح ومنظم" : "Clear and structured usage"}
          />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-8 text-sm leading-8 text-text-soft">
            {ar
              ? "باستخدامك للموقع فإنك توافق على آلية الطلب، الدفع عند الاستلام، وسياسات التوصيل والإرجاع المعروضة في هذه النسخة."
              : "By using the site, you agree to the ordering flow, cash on delivery method and the delivery or returns policies presented in this release."}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
