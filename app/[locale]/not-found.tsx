import { EmptyState } from "@/components/ui/empty-state";

export default async function LocaleNotFound({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params)?.locale === "en" ? "en" : "ar";

  return (
    <div className="page-section py-16">
      <div className="section-container">
        <EmptyState
          title={locale === "ar" ? "الصفحة غير موجودة" : "Page not found"}
          body={
            locale === "ar"
              ? "قد تكون الصفحة قد نُقلت أو لم تعد متاحة."
              : "The page may have moved or is no longer available."
          }
          ctaLabel={locale === "ar" ? "العودة للرئيسية" : "Back home"}
          ctaHref="/"
        />
      </div>
    </div>
  );
}
