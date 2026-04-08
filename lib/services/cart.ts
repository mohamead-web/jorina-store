import { cookies } from "next/headers";

import type { Prisma } from "@/generated/prisma/client";
import { cookieKeys } from "@/lib/constants/cookies";
import { prisma } from "@/lib/db/prisma";
import type { AppCountry, AppLocale } from "@/types/domain";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          translations: true,
          images: true,
          productCategories: {
            include: {
              category: {
                include: {
                  translations: true
                }
              }
            }
          }
        }
      },
      variant: true
    },
    orderBy: { createdAt: "asc" }
  }
} satisfies Prisma.CartInclude;

type CartWithRelations = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

type ProductStockSnapshot = {
  totalStock: number;
};

type VariantStockSnapshot = {
  stockQty: number;
} | null | undefined;

export type CartState = {
  id: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    slug: string;
    name: string;
    shadeName: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imagePath: string;
    imageAlt: string;
  }>;
  totalQuantity: number;
  subtotal: number;
};

function getTranslation<T extends { localeCode: string }>(
  items: T[],
  locale: AppLocale
) {
  return items.find((item) => item.localeCode === locale) ?? items[0];
}

function getPrimaryImage(
  items: Array<{ isPrimary: boolean; sortOrder: number; path: string; alt: string }>
) {
  return [...items].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder
  )[0];
}

function getAvailableStock(product: ProductStockSnapshot, variant: VariantStockSnapshot) {
  return variant ? variant.stockQty : product.totalStock;
}

function mapCart(cart: CartWithRelations | null, locale: AppLocale): CartState {
  if (!cart) {
    return {
      id: null,
      items: [],
      totalQuantity: 0,
      subtotal: 0
    };
  }

  const items = cart.items.map((item) => {
    const translation = getTranslation(item.product.translations, locale);
    const image = getPrimaryImage(item.product.images);
    const unitPrice = Number(item.currentUnitPrice);

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: translation?.name ?? item.product.slug,
      shadeName: item.variant?.shadeName ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      imagePath: image?.path ?? "/assets/products/placeholder.svg",
      imageAlt: image?.alt ?? translation?.name ?? item.product.slug
    };
  });

  return {
    id: cart.id,
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0)
  };
}

export async function getGuestCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieKeys.cartToken)?.value ?? null;
}

export async function getCartByIdentity({
  userId,
  guestToken,
  locale
}: {
  userId?: string | null;
  guestToken?: string | null;
  locale: AppLocale;
}) {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : guestToken ? { guestToken } : { id: "__none__" },
    include: cartInclude
  });

  return mapCart(cart, locale);
}

export async function ensureCart({
  userId,
  guestToken,
  localeCode,
  countryCode
}: {
  userId?: string | null;
  guestToken?: string | null;
  localeCode: AppLocale;
  countryCode: AppCountry;
}) {
  const existing = await prisma.cart.findFirst({
    where: userId ? { userId } : guestToken ? { guestToken } : undefined
  });

  if (existing) {
    if (existing.localeCode === localeCode && existing.countryCode === countryCode) {
      return existing;
    }

    return prisma.cart.update({
      where: { id: existing.id },
      data: {
        localeCode,
        countryCode
      }
    });
  }

  return prisma.cart.create({
    data: {
      userId: userId ?? undefined,
      guestToken: guestToken ?? undefined,
      localeCode,
      countryCode
    }
  });
}

export async function addCartItem({
  userId,
  guestToken,
  localeCode,
  countryCode,
  productId,
  variantId,
  quantity
}: {
  userId?: string | null;
  guestToken?: string | null;
  localeCode: AppLocale;
  countryCode: AppCountry;
  productId: string;
  variantId?: string | null;
  quantity: number;
}) {
  const cart = await ensureCart({ userId, guestToken, localeCode, countryCode });
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE") {
    throw new Error("This product is no longer available");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const variant = variantId
    ? product.variants.find((entry) => entry.id === variantId)
    : null;

  if (variantId && !variant) {
    throw new Error("Variant not found");
  }

  const unitPrice = Number(variant?.priceOverride ?? product.basePrice);
  const availableStock = getAvailableStock(product, variant);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId ?? null
    }
  });

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (availableStock <= 0) {
    throw new Error("Product is out of stock");
  }

  if (nextQuantity > availableStock) {
    throw new Error("Requested quantity exceeds available stock");
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        currentUnitPrice: unitPrice
      }
    });
    return;
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId: variantId ?? undefined,
      quantity,
      currentUnitPrice: unitPrice
    }
  });
}

export async function updateCartItemQuantity({
  userId,
  guestToken,
  itemId,
  quantity
}: {
  userId?: string | null;
  guestToken?: string | null;
  itemId: string;
  quantity: number;
}) {
  const existing = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: userId ? { userId } : { guestToken: guestToken ?? "" }
    }
  });

  if (!existing) {
    return;
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: itemId }
    });
    return;
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity
    }
  });
}

export async function removeCartItem({
  userId,
  guestToken,
  itemId
}: {
  userId?: string | null;
  guestToken?: string | null;
  itemId: string;
}) {
  const existing = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: userId ? { userId } : { guestToken: guestToken ?? "" }
    }
  });

  if (!existing) {
    return;
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}

export async function clearCart({
  userId,
  guestToken
}: {
  userId?: string | null;
  guestToken?: string | null;
}) {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { guestToken: guestToken ?? "" }
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });
}

export async function mergeGuestCartIntoUser(userId: string, guestToken: string) {
  const guestCart = await prisma.cart.findFirst({
    where: { guestToken },
    include: { items: true }
  });

  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) {
      await prisma.cart.delete({ where: { id: guestCart.id } });
    }
    return;
  }

  const userCart = await ensureCart({
    userId,
    localeCode: guestCart.localeCode === "en" ? "en" : "ar",
    countryCode: guestCart.countryCode === "SD" ? "SD" : "EG"
  });

  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: userCart.id }
  });

  const ops = [];

  for (const item of guestCart.items) {
    const existing = existingItems.find(
      (e) => e.productId === item.productId && e.variantId === item.variantId
    );

    if (existing) {
      ops.push(
        prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + item.quantity
          }
        })
      );
    } else {
      ops.push(
        prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            currentUnitPrice: item.currentUnitPrice
          }
        })
      );
    }
  }

  ops.push(prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } }));
  ops.push(prisma.cart.delete({ where: { id: guestCart.id } }));

  await prisma.$transaction(ops);
}
