"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { usePreferences } from "@/components/layout/providers";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { addToCartAction } from "@/lib/actions/cart-actions";
import { toggleWishlistAction } from "@/lib/actions/wishlist-actions";
import { formatCurrency } from "@/lib/utils";

export function ProductBuyBox({
  locale,
  product,
  isFavorite = false
}: {
  locale: "ar" | "en";
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number | null;
    variants: Array<{
      id: string;
      shadeName: string;
      shadeLabel: string | null;
      swatchHex: string | null;
      price: number;
      stockQty: number;
    }>;
  };
  isFavorite?: boolean;
}) {
  const t = useTranslations("product");
  const router = useRouter();
  const { status } = useSession();
  const { currencyCode } = usePreferences();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(isFavorite);
  const [isCartPending, setIsCartPending] = useState(false);
  const [isWishlistPending, setIsWishlistPending] = useState(false);

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const currentPrice = selectedVariant?.price ?? product.price;
  const isOutOfStock =
    Boolean(selectedVariant) && (selectedVariant?.stockQty ?? 0) <= 0;

  const handleAddToCart = () => {
    setIsCartPending(true);
    startTransition(async () => {
      const result = await addToCartAction({
        localeCode: locale,
        productId: product.id,
        variantId: selectedVariantId,
        quantity
      });
      setIsCartPending(false);

      if (result.success) {
        router.refresh();
        toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
        return;
      }

      toast.error(
        result.error ??
          (locale === "ar"
            ? "تعذر إضافة المنتج إلى السلة"
            : "Failed to add product to cart")
      );
    });
  };

  const handleToggleWishlist = () => {
    if (status !== "authenticated") {
      void signIn(undefined, {
        callbackUrl: `/${locale}/products/${product.slug}`
      });
      return;
    }

    setIsWishlistPending(true);
    startTransition(async () => {
      const result = await toggleWishlistAction({
        localeCode: locale,
        productId: product.id
      });
      setFavorite(Boolean(result.saved));
      setIsWishlistPending(false);
      router.refresh();
      toast.success(
        result.saved
          ? locale === "ar"
            ? "تمت الإضافة إلى المفضلة"
            : "Saved to favorites"
          : locale === "ar"
            ? "تمت الإزالة من المفضلة"
            : "Removed from favorites"
      );
    });
  };

  return (
    <>
      <div className="premium-card h-full px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-[2.45rem] leading-[0.96] text-text sm:text-[3.3rem] lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-text-soft sm:mt-4">
              {product.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-text">
              {formatCurrency(currentPrice, locale, currencyCode)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-text-muted line-through">
                {formatCurrency(product.compareAtPrice, locale, currencyCode)}
              </span>
            ) : null}
          </div>

          {product.variants.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text">{t("shade")}</p>
                {selectedVariant?.shadeLabel ? (
                  <span className="text-xs text-text-muted">
                    {selectedVariant.shadeLabel}
                  </span>
                ) : null}
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap"
                data-lenis-prevent
              >
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-sm transition ${
                      selectedVariantId === variant.id
                        ? "border-text bg-text text-white"
                        : "border-border bg-white text-text"
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {variant.swatchHex ? (
                        <span
                          className="h-3 w-3 rounded-full border border-white/60"
                          style={{ backgroundColor: variant.swatchHex }}
                        />
                      ) : null}
                      {variant.shadeName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-3 text-sm font-medium text-text">{t("quantity")}</p>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          <div className="hidden gap-2 lg:flex">
            <Button
              type="button"
              className="flex-1"
              size="lg"
              disabled={isCartPending || isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? t("outOfStock") : t("addToCart")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-12 w-12 rounded-full p-0"
              disabled={isWishlistPending}
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="space-y-3 border-t border-border pt-5 text-sm leading-7 text-text-soft">
            <div>
              <h3 className="font-medium text-text">{t("delivery")}</h3>
              <p>
                {locale === "ar"
                  ? "الشحن داخل مصر برسوم حسب المحافظة، مع توصيل مجاني داخل السودان والدفع عند الاستلام."
                  : "Shipping across Egypt with governorate-based fees, plus free delivery across Sudan. Cash on delivery is available."}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-text">{t("returns")}</h3>
              <p>
                {locale === "ar"
                  ? "يمكن طلب الإرجاع للطلبات المؤهلة خلال 7 أيام بعد التسليم."
                  : "Eligible delivered orders can request a return within 7 days after delivery."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed inset-x-0 z-40 border-t border-black/8 bg-white/95 px-4 py-3.5 shadow-[0_-18px_36px_-24px_rgba(17,17,17,0.18)] backdrop-blur-3xl lg:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px))",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)"
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">
              {formatCurrency(currentPrice, locale, currencyCode)}
            </p>
            <p className="truncate text-[11px] text-text-soft">
              {selectedVariant?.shadeName
                ? `${selectedVariant.shadeName} • ${quantity}`
                : locale === "ar"
                  ? `الكمية ${quantity}`
                  : `Qty ${quantity}`}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-14 w-14 shrink-0 rounded-full p-0"
            disabled={isWishlistPending}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-14 min-w-[10.5rem] shrink-0 rounded-[1.1rem] text-base"
            disabled={isCartPending || isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock
              ? locale === "ar"
                ? "نفد المخزون"
                : "Sold out"
              : locale === "ar"
                ? "أضيفي الآن"
                : "Add now"}
          </Button>
        </div>
      </div>
    </>
  );
}
