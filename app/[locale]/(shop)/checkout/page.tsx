import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartByIdentity, getGuestCartToken } from "@/lib/services/cart";
import { getResolvedPreferences } from "@/lib/services/preferences";

export default async function CheckoutPage({
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

  if (cart.items.length === 0) {
    return (
      <div className="page-section py-16">
        <div className="section-container">
          <EmptyState
            title={typedLocale === "ar" ? "لا يمكن إتمام الطلب" : "Checkout is not ready"}
            body={
              typedLocale === "ar"
                ? "أضيفي منتجات إلى السلة أولًا قبل متابعة الشراء."
                : "Add products to your cart before moving into checkout."
            }
            ctaLabel={typedLocale === "ar" ? "العودة للمتجر" : "Return to shop"}
            ctaHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-section py-8 lg:py-10">
      <div className="section-container">
        <CheckoutWizard
          locale={typedLocale}
          subtotal={cart.subtotal}
          countryCode={preferences.countryCode}
          currencyCode={preferences.currencyCode}
          defaults={{
            email: user?.email ?? "",
            countryCode: preferences.countryCode
          }}
        />
      </div>
    </div>
  );
}
