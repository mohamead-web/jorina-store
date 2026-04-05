import { OrderCard } from "@/components/account/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/guards";
import { getOrdersForUser } from "@/lib/services/order";

export default async function OrdersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={typedLocale === "ar" ? "الطلبات" : "Orders"}
        title={typedLocale === "ar" ? "جميع طلباتك" : "All of your orders"}
      />
      {orders.length === 0 ? (
        <EmptyState
          title={typedLocale === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
          body={
            typedLocale === "ar"
              ? "بمجرد إتمام أول طلب، ستظهر جميع التفاصيل هنا."
              : "Once you place your first order, the details will appear here."
          }
          ctaLabel={typedLocale === "ar" ? "العودة للمتجر" : "Go to shop"}
          ctaHref="/shop"
        />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              locale={typedLocale}
              order={{
                orderNumber: order.orderNumber,
                status: order.status,
                total: Number(order.total),
                createdAt: order.createdAt,
                itemCount: order.items.length
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
