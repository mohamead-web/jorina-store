"use client";

import Image from "next/image";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  removeCartItemAction,
  updateCartItemAction
} from "@/lib/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { formatCurrency } from "@/lib/utils";
import { usePreferences } from "@/components/layout/providers";

export function CartLineItem({
  locale,
  item
}: {
  locale: "ar" | "en";
  item: {
    id: string;
    name: string;
    shadeName: string | null;
    quantity: number;
    lineTotal: number;
    imagePath: string;
    imageAlt: string;
  };
}) {
  const router = useRouter();
  const { currencyCode } = usePreferences();
  const [quantity, setQuantity] = useState(item.quantity);

  // Sync state if it changes from the server (e.g. after refresh or failure)
  import("react").then(({ useEffect }) => {
     useEffect(() => {
        setQuantity(item.quantity);
     }, [item.quantity]);
  });

  return (
    <div className="premium-card flex flex-col gap-4 p-4 min-[390px]:flex-row">
      <div className="relative h-40 overflow-hidden rounded-[1.2rem] bg-white min-[390px]:h-28 min-[390px]:w-24">
        <Image
          src={item.imagePath}
          alt={item.imageAlt}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.8rem] text-text sm:text-2xl">{item.name}</h3>
          {item.shadeName ? (
            <p className="mt-1 text-sm text-text-soft">{item.shadeName}</p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-text">
            {formatCurrency(item.lineTotal, locale, currencyCode)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={quantity}
            onChange={(nextValue) => {
              setQuantity(nextValue);
              startTransition(async () => {
                await updateCartItemAction({
                  localeCode: locale,
                  itemId: item.id,
                  quantity: nextValue
                });
                router.refresh();
              });
            }}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              startTransition(async () => {
                await removeCartItemAction({
                  localeCode: locale,
                  itemId: item.id
                });
                router.refresh();
                toast.success(locale === "ar" ? "تمت إزالة المنتج" : "Item removed");
              });
            }}
          >
            {locale === "ar" ? "إزالة" : "Remove"}
          </Button>
        </div>
      </div>
    </div>
  );
}
