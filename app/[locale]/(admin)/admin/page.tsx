import {
  ClipboardList,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Users,
  XCircle
} from "lucide-react";

import { getAdminStats } from "@/lib/services/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ar = locale === "ar";
  const stats = await getAdminStats();

  const cards = [
    {
      icon: ClipboardList,
      label: ar ? "إجمالي الطلبات" : "Total Orders",
      value: stats.totalOrders,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400"
    },
    {
      icon: Clock,
      label: ar ? "بانتظار المراجعة" : "Pending",
      value: stats.pendingOrders,
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400"
    },
    {
      icon: CheckCircle2,
      label: ar ? "تم التأكيد" : "Confirmed",
      value: stats.confirmedOrders,
      color: "from-sky-500/20 to-sky-600/5",
      iconColor: "text-sky-400"
    },
    {
      icon: Truck,
      label: ar ? "قيد الشحن" : "Shipped",
      value: stats.shippedOrders,
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400"
    },
    {
      icon: Package,
      label: ar ? "تم التسليم" : "Delivered",
      value: stats.deliveredOrders,
      color: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-400"
    },
    {
      icon: XCircle,
      label: ar ? "ملغي" : "Cancelled",
      value: stats.cancelledOrders,
      color: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400"
    },
    {
      icon: DollarSign,
      label: ar ? "إجمالي الإيرادات" : "Total Revenue",
      value: formatCurrency(stats.totalRevenue, locale),
      color: "from-rose-500/20 to-rose-600/5",
      iconColor: "text-rose-400"
    },
    {
      icon: Users,
      label: ar ? "العملاء" : "Customers",
      value: stats.totalCustomers,
      color: "from-violet-500/20 to-violet-600/5",
      iconColor: "text-violet-400"
    },
    {
      icon: ShoppingBag,
      label: ar ? "المنتجات النشطة" : "Active Products",
      value: stats.totalProducts,
      color: "from-pink-500/20 to-pink-600/5",
      iconColor: "text-pink-400"
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">
          {ar ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {ar ? "نظرة عامة على أداء المتجر" : "Store performance overview"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border border-white/5 bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm transition-all hover:border-white/10`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  {card.label}
                </p>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
