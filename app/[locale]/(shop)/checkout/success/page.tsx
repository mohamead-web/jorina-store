import { EmptyState } from "@/components/ui/empty-state";

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const { order } = await searchParams;

  return (
    <div className="page-section py-16">
      <div className="section-container">
        <EmptyState
          title={
            typedLocale === "ar"
              ? `تم استلام طلبك${order ? ` #${order}` : ""}`
              : `Your order has been received${order ? ` #${order}` : ""}`
          }
          body={
            typedLocale === "ar"
              ? "سنراجع الطلب ونقوم بتأكيده هاتفيًا قبل الشحن."
              : "We will review your order and confirm it by phone before shipping."
          }
          ctaLabel={typedLocale === "ar" ? "العودة للرئيسية" : "Back to home"}
          ctaHref="/"
        />
      </div>
    </div>
  );
}
