import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/guards";
import { getWishlist, getWishlistIds } from "@/lib/services/wishlist";

export default async function FavoritesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const [favorites, favoriteIds] = await Promise.all([
    getWishlist(user.id, typedLocale),
    getWishlistIds(user.id)
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={typedLocale === "ar" ? "المفضلة" : "Favorites"}
        title={typedLocale === "ar" ? "منتجاتك المحفوظة" : "Your saved products"}
      />
      {favorites.length === 0 ? (
        <EmptyState
          title={typedLocale === "ar" ? "لا توجد مفضلات بعد" : "No favorites yet"}
          body={
            typedLocale === "ar"
              ? "احفظي المنتجات التي تعجبك لتجديها هنا سريعًا."
              : "Save the products you love and they will appear here."
          }
          ctaLabel={typedLocale === "ar" ? "العودة للمتجر" : "Go to shop"}
          ctaHref="/shop"
        />
      ) : (
        <ProductGrid locale={typedLocale} products={favorites} favoriteIds={favoriteIds} />
      )}
    </div>
  );
}
