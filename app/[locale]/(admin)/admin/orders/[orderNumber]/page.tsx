import { ArrowRight, MapPin, Package, Phone, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminStatusUpdater } from "@/components/admin/status-updater";
import { getAdminOrderByNumber } from "@/lib/services/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  const ar = locale === "ar";
  const order = await getAdminOrderByNumber(orderNumber);
  const orderCurrency = order?.countryCode === "SD" ? "SDG" : "EGP";

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/${locale}/admin/orders`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-colors hover:border-white/20 hover:text-white"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            {ar ? "طلب" : "Order"} #{order.orderNumber}
          </h1>
          <p className="mt-0.5 text-sm text-white/40">{formatDate(order.createdAt, locale)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
              {ar ? "المنتجات" : "Items"} ({order.items.length})
            </h2>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                    <Package className="h-5 w-5 text-white/20" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{item.productName}</p>
                    {item.variantName ? (
                      <p className="text-xs text-white/30">{item.variantName}</p>
                    ) : null}
                  </div>
                  <div className="text-end">
                    <p className="text-sm text-white/60">×{item.quantity}</p>
                    <p className="text-sm text-white/80">
                      {formatCurrency(Number(item.totalPrice), locale, orderCurrency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">{ar ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="text-white/70">
                  {formatCurrency(Number(order.subtotal), locale, orderCurrency)}
                </span>
              </div>
              {Number(order.discountAmount) > 0 ? (
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-white/40">{ar ? "الخصم" : "Discount"}</span>
                    {order.couponCode ? (
                      <p className="mt-1 text-xs text-white/25">
                        {ar ? "الكود" : "Code"}: {order.couponCode}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-emerald-300">
                    -{formatCurrency(Number(order.discountAmount), locale, orderCurrency)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-white/40">{ar ? "رسوم الشحن" : "Shipping"}</span>
                <span className="text-white/70">
                  {formatCurrency(Number(order.shippingFee), locale, orderCurrency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-base font-semibold">
                <span className="text-white/60">{ar ? "الإجمالي" : "Total"}</span>
                <span className="text-rose-300">
                  {formatCurrency(Number(order.total), locale, orderCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
              {ar ? "سجل الحالات" : "Status history"}
            </h2>
            <div className="space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-rose-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white/70">{entry.status}</p>
                    {entry.note ? (
                      <p className="mt-0.5 text-xs text-white/30">{entry.note}</p>
                    ) : null}
                  </div>
                  <p className="text-xs text-white/20">{formatDate(entry.createdAt, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AdminStatusUpdater
            locale={locale as "ar" | "en"}
            orderNumber={order.orderNumber}
            currentStatus={order.status}
          />

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
              {ar ? "معلومات العميل" : "Customer info"}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-white/20" />
                <span className="text-sm text-white/70">{order.fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white/20" />
                <span className="text-sm text-white/70" dir="ltr">
                  {order.phoneNumber}
                </span>
              </div>
              {order.email ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/20">@</span>
                  <span className="text-sm text-white/70">{order.email}</span>
                </div>
              ) : null}
              {order.couponCode ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                  {ar ? "الكوبون المستخدم" : "Used coupon"}: {order.couponCode}
                </div>
              ) : null}
            </div>
          </div>

          {order.addressSnapshot ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
                {ar ? "عنوان الشحن" : "Shipping address"}
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-white/20" />
                <div className="space-y-1 text-sm text-white/60">
                  <p>{order.addressSnapshot.city}</p>
                  <p>{order.addressSnapshot.area}</p>
                  <p>{order.addressSnapshot.detailedAddress}</p>
                  {order.addressSnapshot.latitude && order.addressSnapshot.longitude ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.addressSnapshot.latitude},${order.addressSnapshot.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {ar ? "عرض الموقع على الخريطة" : "View on Google Maps"}
                    </a>
                  ) : null}
                  {order.addressSnapshot.notes ? (
                    <p className="text-xs text-white/30">
                      {ar ? "ملاحظات:" : "Notes:"} {order.addressSnapshot.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
              {ar ? "طريقة الدفع" : "Payment method"}
            </h2>
            <p className="text-sm text-white/60">
              {ar ? "💵 الدفع عند الاستلام" : "💵 Cash on delivery"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
