import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ContactPage({
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
            eyebrow={ar ? "تواصل" : "Contact"}
            title={ar ? "نحن هنا للمساعدة" : "We are here to help"}
            description={
              ar
                ? "يمكنك التواصل معنا لطلبات الدعم، تتبع الطلبات، أو الاستفسار عن المنتجات."
                : "Reach out for support requests, order follow-up or product questions."
            }
          />
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal delay={0.05}>
            <div className="rounded-[1.4rem] border border-border bg-white p-5">
              <p className="text-sm text-text-muted">{ar ? "البريد" : "Email"}</p>
              <p className="mt-3 text-base text-text">hello@jorina.com</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[1.4rem] border border-border bg-white p-5">
              <p className="text-sm text-text-muted">{ar ? "الهاتف" : "Phone"}</p>
              <p className="mt-3 text-base text-text">+966 50 000 0000</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[1.4rem] border border-border bg-white p-5">
              <p className="text-sm text-text-muted">{ar ? "أوقات الرد" : "Response time"}</p>
              <p className="mt-3 text-base text-text">
                {ar ? "خلال يوم عمل واحد" : "Within one business day"}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
