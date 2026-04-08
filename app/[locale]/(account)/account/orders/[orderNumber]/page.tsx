import { notFound } from "next/navigation";

import { ReturnRequestForm } from "@/components/account/return-request-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { requireUser } from "@/lib/auth/guards";
import { canRequestReturn, getOrderByOrderNumber } from "@/lib/services/order";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailsPage({
  params
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const order = await getOrderByOrderNumber(user.id, orderNumber);

  if (!order) {
    notFound();
  }

  const returnable = canRequestReturn(order);
  const orderCurrency = order.countryCode === "SD" ? "SDG" : "EGP";
  const returnedItemIds = new Set(
    order.returnRequests.flatMap((request) => request.items.map((item) => item.orderItemId))
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={`#${order.orderNumber}`}
        title={typedLocale === "ar" ? "تفاصيل الطلب" : "Order details"}
        description={formatDate(order.createdAt, typedLocale)}
      />

      <div className="premium-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill status={order.status} />
          <p className="text-sm font-semibold text-text">
            {formatCurrency(Number(order.total), typedLocale, orderCurrency)}
          </p>
        </div>

        <div className="mt-6 grid gap-3 rounded-[1.4rem] border border-border bg-white p-4 text-sm text-text-soft sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <span>{typedLocale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
            <span className="text-text">
              {formatCurrency(Number(order.subtotal), typedLocale, orderCurrency)}
            </span>
          </div>
          {Number(order.discountAmount) > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <span>{typedLocale === "ar" ? "الخصم" : "Discount"}</span>
                {order.couponCode ? (
                  <p className="mt-1 text-xs text-text-muted">
                    {typedLocale === "ar" ? "الكود" : "Code"}: {order.couponCode}
                  </p>
                ) : null}
              </div>
              <span className="text-emerald-700">
                -{formatCurrency(Number(order.discountAmount), typedLocale, orderCurrency)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span>{typedLocale === "ar" ? "رسوم الشحن" : "Shipping"}</span>
            <span className="text-text">
              {formatCurrency(Number(order.shippingFee), typedLocale, orderCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 font-semibold text-text sm:border-t-0 sm:pt-0">
            <span>{typedLocale === "ar" ? "الإجمالي" : "Total"}</span>
            <span>{formatCurrency(Number(order.total), typedLocale, orderCurrency)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-[1.4rem] border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-text">{item.productName}</h3>
                  <p className="mt-2 text-sm text-text-soft">
                    {item.variantName ?? (typedLocale === "ar" ? "بدون درجة" : "No variant")}
                  </p>
                  <p className="mt-2 text-sm text-text-soft">
                    {item.quantity} ×{" "}
                    {formatCurrency(Number(item.unitPrice), typedLocale, orderCurrency)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text">
                  {formatCurrency(Number(item.totalPrice), typedLocale, orderCurrency)}
                </p>
              </div>
              {returnable && !returnedItemIds.has(item.id) ? (
                <div className="mt-4">
                  <ReturnRequestForm
                    locale={typedLocale}
                    orderId={order.id}
                    orderItemId={item.id}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="premium-card p-5">
        <h2 className="font-display text-3xl text-text">
          {typedLocale === "ar" ? "تسلسل الحالة" : "Status timeline"}
        </h2>
        <div className="mt-5 grid gap-3">
          {order.statusHistory.map((entry) => (
            <div key={entry.id} className="rounded-[1.3rem] border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <StatusPill status={entry.status} />
                <p className="text-xs text-text-muted">
                  {formatDate(entry.createdAt, typedLocale)}
                </p>
              </div>
              {entry.note ? (
                <p className="mt-3 text-sm leading-7 text-text-soft">{entry.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {order.addressSnapshot ? (
        <div className="premium-card p-5">
          <h2 className="font-display text-3xl text-text">
            {typedLocale === "ar" ? "عنوان الشحن" : "Shipping details"}
          </h2>
          <p className="mt-4 text-sm leading-8 text-text-soft">
            {order.addressSnapshot.fullName} · {order.addressSnapshot.phoneNumber}
          </p>
          <p className="mt-2 text-sm leading-8 text-text-soft">
            {order.addressSnapshot.city} · {order.addressSnapshot.area} ·{" "}
            {order.addressSnapshot.detailedAddress}
          </p>
          {order.addressSnapshot.notes ? (
            <p className="mt-2 text-sm leading-8 text-text-soft">
              {order.addressSnapshot.notes}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
