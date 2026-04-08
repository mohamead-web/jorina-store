import { prisma } from "@/lib/db/prisma";

function getTranslation<T extends { localeCode: string }>(items: T[], locale: string) {
  return items.find((item) => item.localeCode === locale) ?? items[0];
}

function getPrimaryImage(items: Array<{ isPrimary: boolean; sortOrder: number; path: string; alt: string }>) {
  return [...items].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)[0];
}

export async function getWishlist(userId: string, locale: string) {
  const wishlist = await prisma.wishlistItem.findMany({
    where: {
      userId,
      product: {
        status: "ACTIVE"
      }
    },
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
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return wishlist.map((entry) => {
    const translation = getTranslation(entry.product.translations, locale);
    const image = getPrimaryImage(entry.product.images);

    return {
      id: entry.id,
      productId: entry.productId,
      slug: entry.product.slug,
      name: translation?.name ?? entry.product.slug,
      shortDescription: translation?.shortDescription ?? "",
      price: Number(entry.product.basePrice),
      compareAtPrice: entry.product.compareAtPrice
        ? Number(entry.product.compareAtPrice)
        : null,
      imagePath: image?.path ?? "/assets/products/placeholder.svg",
      imageAlt: image?.alt ?? translation?.name ?? entry.product.slug,
      categoryName:
        entry.product.productCategories[0]?.category.translations.find(
          (item) => item.localeCode === locale
        )?.name ?? null,
      inStock: entry.product.totalStock > 0
    };
  });
}

export async function toggleWishlist(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: "ACTIVE"
    },
    select: { id: true }
  });

  if (!product) {
    throw new Error("Product is no longer available");
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id }
    });

    return { saved: false };
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      productId
    }
  });

  return { saved: true };
}

export async function getWishlistIds(userId?: string | null) {
  if (!userId) {
    return new Set<string>();
  }

  const items = await prisma.wishlistItem.findMany({
    where: {
      userId,
      product: {
        status: "ACTIVE"
      }
    },
    select: { productId: true }
  });

  return new Set(items.map((item) => item.productId));
}
