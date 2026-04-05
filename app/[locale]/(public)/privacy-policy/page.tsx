import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function PrivacyPolicyPage({
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
            eyebrow={ar ? "الخصوصية" : "Privacy"}
            title={ar ? "خصوصيتك جزء أساسي من التجربة" : "Your privacy is part of the experience"}
          />
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-8 text-sm leading-8 text-text-soft">
            {ar
              ? "نحتفظ فقط بالبيانات اللازمة لإتمام الطلبات، إدارة الحساب، وتحسين التجربة. لا تتم مشاركة البيانات إلا ضمن حدود التشغيل والخدمات المرتبطة بالطلب."
              : "We retain only the data needed to complete orders, manage accounts and improve the experience. Data is shared only within operational boundaries related to your order."}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
