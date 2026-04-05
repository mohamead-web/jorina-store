import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ShippingDeliveryPage({
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
            eyebrow={ar ? "الشحن والتوصيل" : "Shipping & delivery"}
            title={ar ? "معلومات التوصيل" : "Delivery information"}
          />
        </Reveal>
        <div className="mt-8 space-y-5 text-sm leading-8 text-text-soft">
          <Reveal delay={0.05}>
            <p>
              {ar
                ? "نوفر خدمة التوصيل لجميع محافظات مصر. القاهرة والجيزة: 50 ج.م، الإسكندرية: 60 ج.م، باقي المحافظات: 80 ج.م. الدفع عند الاستلام."
                : "We deliver across all Egyptian governorates. Cairo & Giza: 50 EGP, Alexandria: 60 EGP, other governorates: 80 EGP. Cash on delivery."}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              {ar
                ? "يتم تأكيد الطلب خلال ساعات العمل ومتابعة التوصيل حتى وصوله إليك بأمان."
                : "Orders are confirmed during working hours and tracked until safe delivery to your doorstep."}
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
