import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/guards";
import { getReturnRequestsForUser } from "@/lib/services/returns";

export default async function ReturnsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const requests = await getReturnRequestsForUser(user.id);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={typedLocale === "ar" ? "الإرجاعات" : "Returns"}
        title={typedLocale === "ar" ? "طلبات الإرجاع" : "Return requests"}
      />
      {requests.length === 0 ? (
        <EmptyState
          title={typedLocale === "ar" ? "لا توجد طلبات إرجاع" : "No return requests"}
          body={
            typedLocale === "ar"
              ? "يمكنك طلب الإرجاع من صفحة تفاصيل الطلب إذا كانت الحالة مؤهلة."
              : "You can request a return from the order details page when an order is eligible."
          }
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="premium-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-text">
                    #{request.order.orderNumber}
                  </h3>
                  <p className="mt-2 text-sm text-text-soft">
                    {formatDate(request.createdAt, typedLocale)}
                  </p>
                </div>
                <StatusPill status={request.status} />
              </div>
              <p className="mt-4 text-sm leading-7 text-text-soft">{request.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
