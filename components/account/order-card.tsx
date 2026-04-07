import { Link } from "@/lib/i18n/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";

export function OrderCard({
  locale,
  order
}: {
  locale: "ar" | "en";
  order: {
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    itemCount: number;
    currencyCode: "EGP" | "SDG";
  };
}) {
  return (
    <div className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
            #{order.orderNumber}
          </p>
          <h3 className="mt-2 font-display text-2xl text-text">
            {locale === "ar" ? "طلب" : "Order"} {order.orderNumber}
          </h3>
        </div>
        <StatusPill status={order.status} />
      </div>
      <div className="mt-5 flex flex-wrap gap-6 text-sm text-text-soft">
        <p>{formatDate(order.createdAt, locale)}</p>
        <p>
          {order.itemCount} {locale === "ar" ? "منتج" : "items"}
        </p>
        <p>{formatCurrency(order.total, locale, order.currencyCode)}</p>
      </div>
      <Link
        href={`/account/orders/${order.orderNumber}`}
        className="mt-5 inline-flex text-sm text-text hover:text-blush-strong"
      >
        {locale === "ar" ? "عرض التفاصيل" : "View details"}
      </Link>
    </div>
  );
}
