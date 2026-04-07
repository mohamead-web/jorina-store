import { CartLineItem } from "@/components/checkout/cart-line-item";
import { OrderSummary } from "@/components/checkout/order-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getShippingFeeForLocation } from "@/lib/constants/commerce";
import { Link } from "@/lib/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartByIdentity, getGuestCartToken } from "@/lib/services/cart";
import { getResolvedPreferences } from "@/lib/services/preferences";
import { formatCurrency } from "@/lib/utils";

export default async function CartPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const guestToken = await getGuestCartToken();
  const preferences = await getResolvedPreferences(user?.id);
  const cart = await getCartByIdentity({
    userId: user?.id,
    guestToken: user?.id ? null : guestToken,
    locale: typedLocale
  });
  const shippingFee = getShippingFeeForLocation(preferences.countryCode);

  if (cart.items.length === 0) {
    return (
      <div className="page-section py-16">
        <div className="section-container">
          <EmptyState
            title={typedLocale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
            body={
              typedLocale === "ar"
                ? "ابدئي بإضافة منتجات مختارة لتكملي تجربة JORINA."
                : "Start by adding a few considered products to continue your JORINA experience."
            }
            ctaLabel={typedLocale === "ar" ? "العودة للتسوق" : "Back to shopping"}
            ctaHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-section pb-[calc(env(safe-area-inset-bottom,0px)+7.5rem)] pt-8 lg:pb-10 lg:pt-10">
      <div className="section-container grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {cart.items.map((item) => (
            <CartLineItem key={item.id} locale={typedLocale} item={item} />
          ))}
        </div>
        <div className="hidden space-y-4 lg:block">
          <OrderSummary
            locale={typedLocale}
            subtotal={cart.subtotal}
            shippingFee={shippingFee}
            currency={preferences.currencyCode}
          />
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">
              {typedLocale === "ar" ? "إتمام الطلب" : "Proceed to checkout"}
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="fixed inset-x-0 z-40 border-t border-black/8 bg-white/95 px-4 py-3 shadow-[0_-18px_36px_-24px_rgba(17,12,12,0.28)] backdrop-blur-xl lg:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px))",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)"
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
              {typedLocale === "ar" ? "إجمالي الطلب" : "Order total"}
            </p>
            <p className="mt-1 text-sm font-semibold text-text">
              {formatCurrency(
                cart.subtotal + shippingFee,
                typedLocale,
                preferences.currencyCode
              )}
            </p>
          </div>
          <Button asChild size="lg" className="h-12 min-w-[10rem]">
            <Link href="/checkout">
              {typedLocale === "ar" ? "إتمام الطلب" : "Checkout"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
