import { Plus } from "lucide-react";

import { CouponArchiveButton } from "@/components/admin/coupon-archive-button";
import { CouponCopyButton } from "@/components/admin/coupon-copy-button";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getAdminCoupons } from "@/lib/services/admin-coupons";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusStyles = {
  ACTIVE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  SCHEDULED: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  EXPIRED: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  ARCHIVED: "border-white/10 bg-white/10 text-white/65"
} as const;

const statusLabels = {
  ACTIVE: { ar: "نشط", en: "Active" },
  SCHEDULED: { ar: "مجدول", en: "Scheduled" },
  EXPIRED: { ar: "منتهي", en: "Expired" },
  ARCHIVED: { ar: "مؤرشف", en: "Archived" }
} as const;

export default async function AdminCouponsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-300/70">
            {typedLocale === "ar" ? "عروض الأدمن" : "Admin offers"}
          </p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            {typedLocale === "ar" ? "إدارة الكوبونات" : "Manage coupons"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            {typedLocale === "ar"
              ? "أنشئ كوبونات خصم عامة أو مخصصة، وتتبع حالتها وعدد استخداماتها من شاشة واحدة."
              : "Create public or targeted discount coupons and track their status and usage from one place."}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4" />
            {typedLocale === "ar" ? "إنشاء كوبون" : "Create coupon"}
          </Link>
        </Button>
      </div>

      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-sm text-white/45 sm:px-6">
          <span>
            {typedLocale === "ar"
              ? `${coupons.length} كوبون`
              : `${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`}
          </span>
          <span>
            {typedLocale === "ar"
              ? "الخصم يطبق على المجموع الفرعي فقط"
              : "Discounts apply to subtotal only"}
          </span>
        </div>

        <div className="divide-y divide-white/8">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.35fr)_0.9fr_0.7fr_0.9fr_0.9fr]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl text-white">{coupon.code}</h2>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusStyles[coupon.status]}`}
                  >
                    {typedLocale === "ar"
                      ? statusLabels[coupon.status].ar
                      : statusLabels[coupon.status].en}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
                  <span>
                    {coupon.discountType === "PERCENTAGE"
                      ? typedLocale === "ar"
                        ? `خصم ${coupon.discountValue}%`
                        : `${coupon.discountValue}% off`
                      : typedLocale === "ar"
                        ? `خصم ثابت ${formatCurrency(coupon.discountValue, typedLocale, "EGP")}`
                        : `${formatCurrency(coupon.discountValue, typedLocale, "EGP")} fixed`}
                  </span>
                  <span>
                    {coupon.audienceType === "PUBLIC"
                      ? typedLocale === "ar"
                        ? "عام"
                        : "Public"
                      : typedLocale === "ar"
                        ? `مخصص لـ ${coupon.allowedEmailCount}`
                        : `Targeted to ${coupon.allowedEmailCount}`}
                  </span>
                  {coupon.minSubtotal ? (
                    <span>
                      {typedLocale === "ar"
                        ? `الحد الأدنى ${formatCurrency(coupon.minSubtotal, typedLocale, "EGP")}`
                        : `Min ${formatCurrency(coupon.minSubtotal, typedLocale, "EGP")}`}
                    </span>
                  ) : null}
                </div>
                {coupon.allowedEmailsPreview.length > 0 ? (
                  <p className="mt-3 text-sm text-white/35">
                    {coupon.allowedEmailsPreview.join(" · ")}
                    {coupon.allowedEmailCount > coupon.allowedEmailsPreview.length
                      ? typedLocale === "ar"
                        ? ` +${coupon.allowedEmailCount - coupon.allowedEmailsPreview.length} أكثر`
                        : ` +${coupon.allowedEmailCount - coupon.allowedEmailsPreview.length} more`
                      : ""}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "الاستخدام" : "Usage"}
                </p>
                <p className="text-lg font-medium text-white">{coupon.redemptionCount}</p>
                <p className="text-sm text-white/35">
                  {typeof coupon.maxRedemptions === "number"
                    ? typedLocale === "ar"
                      ? `من ${coupon.maxRedemptions}`
                      : `of ${coupon.maxRedemptions}`
                    : typedLocale === "ar"
                      ? "بدون حد إجمالي"
                      : "No total cap"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "لكل عميل" : "Per customer"}
                </p>
                <p className="text-lg font-medium text-white">{coupon.perCustomerLimit}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  {typedLocale === "ar" ? "الصلاحية" : "Validity"}
                </p>
                <p className="text-sm text-white/70">
                  {coupon.startsAt
                    ? formatDate(coupon.startsAt, typedLocale)
                    : typedLocale === "ar"
                      ? "فوري"
                      : "Immediate"}
                </p>
                <p className="text-sm text-white/35">
                  {coupon.expiresAt
                    ? formatDate(coupon.expiresAt, typedLocale)
                    : typedLocale === "ar"
                      ? "بدون انتهاء"
                      : "No expiry"}
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                <Button asChild variant="secondary">
                  <Link href={`/admin/coupons/${coupon.id}`}>
                    {typedLocale === "ar" ? "تعديل" : "Edit"}
                  </Link>
                </Button>
                <CouponCopyButton locale={typedLocale} code={coupon.code} />
                {!coupon.isArchived ? (
                  <CouponArchiveButton locale={typedLocale} couponId={coupon.id} />
                ) : null}
              </div>
            </div>
          ))}

          {coupons.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-white/35">
              {typedLocale === "ar"
                ? "لا توجد كوبونات بعد. أنشئ أول كوبون لبدء تقديم الخصومات."
                : "No coupons yet. Create the first coupon to start offering discounts."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
