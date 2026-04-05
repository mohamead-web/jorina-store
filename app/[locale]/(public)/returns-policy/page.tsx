import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ReturnsPolicyPage({
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
            eyebrow={ar ? "سياسة الإرجاع" : "Returns policy"}
            title={ar ? "إرجاع واضح ومفهوم" : "A clear and understandable return flow"}
          />
        </Reveal>
        <div className="mt-8 space-y-5 text-sm leading-8 text-text-soft">
          <Reveal delay={0.05}>
            <p>
              {ar
                ? "الطلبات المؤهلة يمكنها تقديم طلب إرجاع خلال 7 أيام من تاريخ التسليم. تبدأ العملية من صفحة الحساب ثم تمر بمراجعة أولية."
                : "Eligible delivered orders can request a return within 7 days from delivery. The process starts in the account area and goes through an initial review."}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              {ar
                ? "في هذه المرحلة، تتم مراجعة طلبات الإرجاع يدويًا قبل تحديد الخطوة التالية."
                : "At this stage, return requests are manually reviewed before the next step is confirmed."}
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
