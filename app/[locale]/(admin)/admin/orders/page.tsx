import Link from "next/link";

import { getAllOrders } from "@/lib/services/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "بانتظار المراجعة", en: "Pending" },
  CONFIRMED: { ar: "تم التأكيد", en: "Confirmed" },
  SHIPPED: { ar: "قيد الشحن", en: "Shipped" },
  DELIVERED: { ar: "تم التسليم", en: "Delivered" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
  RETURNED: { ar: "مُرتجع", en: "Returned" }
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  CONFIRMED: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  SHIPPED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  DELIVERED: "bg-green-500/15 text-green-300 border-green-500/20",
  CANCELLED: "bg-red-500/15 text-red-300 border-red-500/20",
  RETURNED: "bg-violet-500/15 text-violet-300 border-violet-500/20"
};

export default async function AdminOrdersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";
  const orders = await getAllOrders();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">
            {ar ? "إدارة الطلبات" : "Order Management"}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {ar
              ? `${orders.length} طلب`
              : `${orders.length} orders`}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <p className="text-lg text-white/30">
            {ar ? "لا توجد طلبات بعد" : "No orders yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "رقم الطلب" : "Order #"}
                </th>
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "العميل" : "Customer"}
                </th>
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "الإجمالي" : "Total"}
                </th>
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "المنتجات" : "Items"}
                </th>
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "الحالة" : "Status"}
                </th>
                <th className="px-5 py-4 text-start text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "التاريخ" : "Date"}
                </th>
                <th className="px-5 py-4 text-end text-xs uppercase tracking-[0.18em] text-white/30">
                  {ar ? "إجراء" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 font-mono text-sm text-white/80">
                    #{order.orderNumber}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-white/80">{order.fullName}</p>
                      <p className="text-xs text-white/30">{order.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/80">
                    {formatCurrency(Number(order.total), locale, order.countryCode === "SD" ? "SDG" : "EGP")}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/50">
                    {order.items.length}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${statusColors[order.status] ?? "bg-white/5 text-white/40"}`}
                    >
                      {ar
                        ? statusLabels[order.status]?.ar
                        : statusLabels[order.status]?.en}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/40">
                    {formatDate(order.createdAt, locale)}
                  </td>
                  <td className="px-5 py-4 text-end">
                    <Link
                      href={`/${locale}/admin/orders/${order.orderNumber}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-all hover:border-rose-400/30 hover:text-rose-300"
                    >
                      {ar ? "تفاصيل" : "Details"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
