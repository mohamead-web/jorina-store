import { Heart, MapPinHouse, ShoppingBag } from "lucide-react";

import { OrderCard } from "@/components/account/order-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/guards";
import { getAddresses } from "@/lib/services/address";
import { getOrdersForUser } from "@/lib/services/order";
import { getWishlist } from "@/lib/services/wishlist";

export default async function AccountOverviewPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const [orders, favorites, addresses] = await Promise.all([
    getOrdersForUser(user.id),
    getWishlist(user.id, typedLocale),
    getAddresses(user.id)
  ]);

  const overviewCards = [
    {
      icon: ShoppingBag,
      value: orders.length,
      label: typedLocale === "ar" ? "إجمالي الطلبات" : "Orders"
    },
    {
      icon: Heart,
      value: favorites.length,
      label: typedLocale === "ar" ? "المنتجات المفضلة" : "Favorites"
    },
    {
      icon: MapPinHouse,
      value: addresses.length,
      label: typedLocale === "ar" ? "العناوين" : "Addresses"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="premium-card px-6 py-6">
        <SectionHeading
          eyebrow={typedLocale === "ar" ? "الحساب" : "Account"}
          title={typedLocale === "ar" ? `مرحبًا ${user.name ?? ""}` : `Welcome ${user.name ?? ""}`}
          description={
            typedLocale === "ar"
              ? "كل ما يتعلق بطلباتك، تفضيلاتك، وعناوينك محفوظ هنا بشكل مرتب."
              : "Orders, preferences and saved addresses stay organized here in one polished account space."
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="premium-card p-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background-soft text-text">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-text">{card.value}</p>
              <p className="mt-2 text-sm text-text-soft">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <SectionHeading
          eyebrow={typedLocale === "ar" ? "آخر الطلبات" : "Recent orders"}
          title={typedLocale === "ar" ? "نظرة سريعة" : "A quick look"}
        />
        <div className="grid gap-4">
          {orders.slice(0, 3).map((order) => (
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
      </div>
    </div>
  );
}
