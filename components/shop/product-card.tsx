"use client";

import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn, useSession } from "next-auth/react";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { addToCartAction } from "@/lib/actions/cart-actions";
import { toggleWishlistAction } from "@/lib/actions/wishlist-actions";
import { Link } from "@/lib/i18n/navigation";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  locale: "ar" | "en";
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number | null;
    imagePath: string;
    imageAlt: string;
    categoryName: string | null;
    inStock: boolean;
  };
  isFavorite?: boolean;
};

export function ProductCard({
  locale,
  product,
  isFavorite = false
}: ProductCardProps) {
  const t = useTranslations("product");
  const router = useRouter();
  const { status } = useSession();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isPending, setIsPending] = useState(false);

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-[1.4rem] border border-black/5 bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:border-black/10 sm:rounded-[1.8rem]">
      <div className="relative w-full overflow-hidden bg-[#fafaf8]">
        {product.categoryName ? (
          <div className="absolute start-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-text backdrop-blur-md">
            {product.categoryName}
          </div>
        ) : null}

        <button
          type="button"
          className="absolute end-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-text backdrop-blur-md transition hover:scale-105 hover:bg-white"
          aria-label={favorite ? t("inWishlist") : t("addToWishlist")}
          onClick={() => {
            if (status !== "authenticated") {
              void signIn(undefined, {
                callbackUrl: `/${locale}/products/${product.slug}`
              });
              return;
            }

            setIsPending(true);
            startTransition(async () => {
              const result = await toggleWishlistAction({
                localeCode: locale,
                productId: product.id
              });
              setFavorite(Boolean(result.saved));
              setIsPending(false);
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
          }}
          disabled={isPending}
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-current text-blush-strong" : ""}`} />
        </button>

        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[0.75] w-full overflow-hidden bg-[#f4f4f4]">
            <Image
              src={product.imagePath}
              alt={product.imageAlt}
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              sizes="(max-width: 389px) 100vw, (max-width: 1279px) 50vw, 25vw"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 px-5 pb-6 pt-5 sm:space-y-5 sm:px-6 sm:pb-7 sm:pt-6">
        <div className="space-y-1.5 sm:space-y-2">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-display text-[1.45rem] leading-[1.02] text-text min-[390px]:text-[1.58rem] sm:text-[1.7rem] lg:text-[2rem]">
              {product.name}
            </h3>
          </Link>
          <p className="hidden text-sm leading-7 text-text-soft sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text sm:text-[15px]">
            {formatCurrency(product.price, locale)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-xs text-text-muted line-through sm:text-sm">
              {formatCurrency(product.compareAtPrice, locale)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-black/6 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <Link
            href={`/products/${product.slug}`}
            className="hidden text-sm text-text-soft transition hover:text-text sm:inline-flex"
          >
            {locale === "ar" ? "عرض التفاصيل" : "View details"}
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-text px-4 text-sm text-white transition hover:bg-[#222] sm:w-auto sm:px-5"
            disabled={!product.inStock || isPending}
            onClick={() => {
              setIsPending(true);
              startTransition(async () => {
                await addToCartAction({
                  localeCode: locale,
                  productId: product.id,
                  quantity: 1
                });
                setIsPending(false);
                router.refresh();
                toast.success(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
              });
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="sm:hidden">{locale === "ar" ? "أضيفي" : "Add"}</span>
            <span className="hidden sm:inline">{t("addToCart")}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
