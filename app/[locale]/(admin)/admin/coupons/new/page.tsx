import { CouponEditorForm } from "@/components/admin/coupon-editor-form";
import { getAdminCouponEditorData } from "@/lib/services/admin-coupons";

export default async function AdminNewCouponPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const data = await getAdminCouponEditorData();

  return (
    <CouponEditorForm
      locale={typedLocale}
      customerOptions={data.customerOptions}
      coupon={null}
    />
  );
}
