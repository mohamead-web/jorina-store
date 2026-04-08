import { CouponArchiveButton } from "@/components/admin/coupon-archive-button";
import { CouponCopyButton } from "@/components/admin/coupon-copy-button";
import { CouponEditorForm } from "@/components/admin/coupon-editor-form";
import { getAdminCouponEditorData } from "@/lib/services/admin-coupons";
import { formatCurrency, formatDate } from "@/lib/utils";

const usageStatusLabels: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "بانتظار المراجعة", en: "Pending" },
  CONFIRMED: { ar: "تم التأكيد", en: "Confirmed" },
  SHIPPED: { ar: "قيد الشحن", en: "Shipped" },
  DELIVERED: { ar: "تم التسليم", en: "Delivered" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
  RETURNED: { ar: "مرتجع", en: "Returned" }
};

export default async function AdminEditCouponPage({
  params
}: {
  params: Promise<{ locale: string; couponId: string }>;
}) {
  const { locale, couponId } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const data = await getAdminCouponEditorData(couponId);

  if (!data.coupon) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <CouponCopyButton locale={typedLocale} code={data.coupon.code} />
        {!data.coupon.isArchived ? (
          <CouponArchiveButton
            locale={typedLocale}
            couponId={data.coupon.id}
            redirectToList
          />
        ) : null}
      </div>

      <CouponEditorForm
        locale={typedLocale}
        customerOptions={data.customerOptions}
        coupon={data.coupon}
      />

      <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="font-display text-2xl text-white">
            {typedLocale === "ar" ? "سجل الاستخدام" : "Usage history"}
          </h2>
          <p className="text-sm leading-7 text-white/45">
            {typedLocale === "ar"
              ? "يظهر هنا كل طلب استخدم هذا الكوبون. الطلبات الملغاة تظل محسوبة ضمن الاستهلاك."
              : "Every order that used this coupon appears here. Cancelled orders still count as consumed."}
          </p>
        </div>

        {data.usageHistory.length === 0 ? (
          <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/35">
            {typedLocale === "ar"
              ? "لم يتم استخدام هذا الكوبون بعد."
              : "This coupon has not been used yet."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.3rem] border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-black/15">
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "الطلب" : "Order"}
                  </th>
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "العميل" : "Customer"}
                  </th>
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "الخصم" : "Discount"}
                  </th>
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "الإجمالي" : "Total"}
                  </th>
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-4 py-3 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                    {typedLocale === "ar" ? "التاريخ" : "Date"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {data.usageHistory.map((entry) => {
                  const currency = entry.countryCode === "SD" ? "SDG" : "EGP";

                  return (
                    <tr key={entry.id} className="bg-white/[0.01]">
                      <td className="px-4 py-4 font-mono text-white/80">#{entry.orderNumber}</td>
                      <td className="px-4 py-4">
                        <p className="text-white/80">{entry.fullName}</p>
                        {entry.email ? (
                          <p className="text-xs text-white/35">{entry.email}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        {formatCurrency(entry.discountAmount, typedLocale, currency)}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        {formatCurrency(entry.total, typedLocale, currency)}
                      </td>
                      <td className="px-4 py-4 text-white/55">
                        {typedLocale === "ar"
                          ? usageStatusLabels[entry.status]?.ar ?? entry.status
                          : usageStatusLabels[entry.status]?.en ?? entry.status}
                      </td>
                      <td className="px-4 py-4 text-white/35">
                        {formatDate(entry.createdAt, typedLocale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
