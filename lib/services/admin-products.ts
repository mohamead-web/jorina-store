import { notFound } from "next/navigation";

import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AppLocale } from "@/types/domain";
import { deleteBlobUrls } from "@/lib/services/blob-storage";
import { adminProductSchema, type AdminProductInput } from "@/lib/validators/admin-product";

const adminProductInclude = {
  translations: true,
  images: {
    orderBy: { sortOrder: "asc" }
  },
  variants: {
    orderBy: { sku: "asc" }
  },
  productCategories: {
    orderBy: { sortOrder: "asc" }
  },
  collections: {
    orderBy: { sortOrder: "asc" }
  }
} satisfies Prisma.ProductInclude;

type AdminProductRecord = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

function pickLocalized<T extends { localeCode: string }>(items: T[], locale: AppLocale) {
  return items.find((item) => item.localeCode === locale) ?? items[0] ?? null;
}

function pickTranslationByCode<T extends { localeCode: string }>(
  items: T[],
  localeCode: AppLocale
) {
  return items.find((item) => item.localeCode === localeCode) ?? null;
}

function pickPrimaryImage(
  items: Array<{ path: string; isPrimary: boolean; sortOrder: number }>
) {
  return [...items].sort(
    (left, right) =>
      Number(right.isPrimary) - Number(left.isPrimary) ||
      left.sortOrder - right.sortOrder
  )[0];
}

function normalizeImagePayload(input: AdminProductInput) {
  const images = [...input.images]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((image, index) => ({
      ...image,
      isPrimary: false,
      sortOrder: index
    }));

  if (images.length > 0) {
    const nextPrimaryIndex = input.images.findIndex((image) => image.isPrimary);
    const primaryIndex = nextPrimaryIndex >= 0 ? nextPrimaryIndex : 0;
    images[Math.min(primaryIndex, images.length - 1)] = {
      ...images[Math.min(primaryIndex, images.length - 1)],
      isPrimary: true
    };
  }

  return images.map((image, index) => ({
    path: image.path,
    alt:
      index === 0
        ? input.translations.en.name || input.translations.ar.name
        : `${input.translations.en.name || input.translations.ar.name} ${index + 1}`,
    sortOrder: index,
    isPrimary: image.isPrimary
  }));
}

function getTotalStock(input: AdminProductInput) {
  if (input.variants.length > 0) {
    return input.variants.reduce((sum, variant) => sum + variant.stockQty, 0);
  }

  return input.totalStock;
}

async function assertProductUniqueness(
  input: AdminProductInput,
  productId?: string
) {
  const [existingSlug, existingProductSku, existingVariantSkus] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: input.slug },
      select: { id: true }
    }),
    prisma.product.findUnique({
      where: { sku: input.sku },
      select: { id: true }
    }),
    input.variants.length > 0
      ? prisma.productVariant.findMany({
          where: {
            sku: { in: input.variants.map((variant) => variant.sku) },
            ...(productId
              ? {
                  productId: { not: productId }
                }
              : {})
          },
          select: { sku: true }
        })
      : Promise.resolve([])
  ]);

  if (existingSlug && existingSlug.id !== productId) {
    throw new Error("Slug is already in use");
  }

  if (existingProductSku && existingProductSku.id !== productId) {
    throw new Error("Product SKU is already in use");
  }

  if (existingVariantSkus.length > 0) {
    throw new Error(`Variant SKU is already in use: ${existingVariantSkus[0].sku}`);
  }
}

function buildProductSearchWhere({
  query,
  status
}: {
  query?: string;
  status?: ProductStatus | "ALL";
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (query) {
    where.OR = [
      {
        slug: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        sku: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        translations: {
          some: {
            name: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      }
    ];
  }

  return where;
}

export async function getAdminProducts({
  locale,
  query,
  status
}: {
  locale: AppLocale;
  query?: string;
  status?: ProductStatus | "ALL";
}) {
  const products = await prisma.product.findMany({
    where: buildProductSearchWhere({ query, status }),
    include: adminProductInclude,
    orderBy: { updatedAt: "desc" }
  });

  return products.map((product) => {
    const localized = pickLocalized(product.translations, locale);
    const arTranslation = pickTranslationByCode(product.translations, "ar");
    const enTranslation = pickTranslationByCode(product.translations, "en");
    const primaryImage = pickPrimaryImage(product.images);

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      status: product.status,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      totalStock: product.totalStock,
      variantCount: product.variants.length,
      updatedAt: product.updatedAt,
      imagePath: primaryImage?.path ?? "/assets/products/placeholder.svg",
      localizedName: localized?.name ?? product.slug,
      nameAr: arTranslation?.name ?? product.slug,
      nameEn: enTranslation?.name ?? product.slug
    };
  });
}

export async function getAdminProductFormOptions(locale: AppLocale) {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" }
    }),
    prisma.collection.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      label: pickLocalized(category.translations, locale)?.name ?? category.slug
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      label:
        pickLocalized(collection.translations, locale)?.title ?? collection.slug
    }))
  };
}

function mapEditorProduct(product: AdminProductRecord) {
  const ar = pickTranslationByCode(product.translations, "ar");
  const en = pickTranslationByCode(product.translations, "en");

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    status: product.status,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    totalStock: product.totalStock,
    translations: {
      ar: {
        name: ar?.name ?? "",
        shortDescription: ar?.shortDescription ?? "",
        longDescription: ar?.longDescription ?? "",
        ingredients: ar?.ingredients ?? null,
        howToUse: ar?.howToUse ?? null,
        seoTitle: ar?.seoTitle ?? null,
        seoDescription: ar?.seoDescription ?? null
      },
      en: {
        name: en?.name ?? "",
        shortDescription: en?.shortDescription ?? "",
        longDescription: en?.longDescription ?? "",
        ingredients: en?.ingredients ?? null,
        howToUse: en?.howToUse ?? null,
        seoTitle: en?.seoTitle ?? null,
        seoDescription: en?.seoDescription ?? null
      }
    },
    images: product.images.map((image) => ({
      id: image.id,
      path: image.path,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      shadeName: variant.shadeName,
      shadeLabel: variant.shadeLabel ?? null,
      swatchHex: variant.swatchHex ?? null,
      stockQty: variant.stockQty,
      priceOverride: variant.priceOverride ? Number(variant.priceOverride) : null
    })),
    categoryIds: product.productCategories.map((entry) => entry.categoryId),
    collectionIds: product.collections.map((entry) => entry.collectionId)
  };
}

export async function getAdminProductEditorData(
  locale: AppLocale,
  productId?: string
) {
  const [options, product] = await Promise.all([
    getAdminProductFormOptions(locale),
    productId
      ? prisma.product.findUnique({
          where: { id: productId },
          include: adminProductInclude
        })
      : Promise.resolve(null)
  ]);

  if (productId && !product) {
    notFound();
  }

  return {
    ...options,
    product: product ? mapEditorProduct(product) : null
  };
}

export async function saveAdminProduct(rawInput: unknown) {
  const input = adminProductSchema.parse(rawInput);
  const normalizedImages = normalizeImagePayload(input);
  const totalStock = getTotalStock(input);

  await assertProductUniqueness(input, input.id);

  if (!input.id) {
    const created = await prisma.product.create({
      data: {
        slug: input.slug,
        sku: input.sku,
        status: input.status,
        basePrice: input.basePrice,
        compareAtPrice: input.compareAtPrice,
        totalStock,
        translations: {
          create: [
            {
              localeCode: "ar",
              ...input.translations.ar
            },
            {
              localeCode: "en",
              ...input.translations.en
            }
          ]
        },
        images: {
          create: normalizedImages
        },
        variants: {
          create: input.variants.map((variant) => ({
            sku: variant.sku,
            shadeName: variant.shadeName,
            shadeLabel: variant.shadeLabel,
            swatchHex: variant.swatchHex,
            stockQty: variant.stockQty,
            priceOverride: variant.priceOverride
          }))
        },
        productCategories: {
          create: input.categoryIds.map((categoryId, index) => ({
            categoryId,
            sortOrder: index
          }))
        },
        collections: {
          create: input.collectionIds.map((collectionId, index) => ({
            collectionId,
            sortOrder: index
          }))
        }
      },
      select: {
        id: true,
        slug: true
      }
    });

    return created;
  }

  const productId = input.id;

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: true
    }
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const nextVariantIds = new Set(
    input.variants
      .map((variant) => variant.id)
      .filter((variantId): variantId is string => Boolean(variantId))
  );
  const removedImages = existingProduct.images.filter(
    (image) =>
      !input.images.some(
        (nextImage) => nextImage.id === image.id || nextImage.path === image.path
      )
  );
  const removedVariantIds = existingProduct.variants
    .filter((variant) => !nextVariantIds.has(variant.id))
    .map((variant) => variant.id);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        slug: input.slug,
        sku: input.sku,
        status: input.status,
        basePrice: input.basePrice,
        compareAtPrice: input.compareAtPrice,
        totalStock
      }
    });

    await tx.productTranslation.deleteMany({
      where: { productId }
    });
    await tx.productTranslation.createMany({
      data: [
        {
          productId,
          localeCode: "ar",
          ...input.translations.ar
        },
        {
          productId,
          localeCode: "en",
          ...input.translations.en
        }
      ]
    });

    await tx.productImage.deleteMany({
      where: { productId }
    });
    if (normalizedImages.length > 0) {
      await tx.productImage.createMany({
        data: normalizedImages.map((image) => ({
          productId,
          ...image
        }))
      });
    }

    await tx.productCategory.deleteMany({
      where: { productId }
    });
    if (input.categoryIds.length > 0) {
      await tx.productCategory.createMany({
        data: input.categoryIds.map((categoryId, index) => ({
          productId,
          categoryId,
          sortOrder: index
        }))
      });
    }

    await tx.productCollection.deleteMany({
      where: { productId }
    });
    if (input.collectionIds.length > 0) {
      await tx.productCollection.createMany({
        data: input.collectionIds.map((collectionId, index) => ({
          productId,
          collectionId,
          sortOrder: index
        }))
      });
    }

    if (removedVariantIds.length > 0) {
      await tx.productVariant.deleteMany({
        where: {
          productId,
          id: { in: removedVariantIds }
        }
      });
    }

    for (const variant of input.variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            sku: variant.sku,
            shadeName: variant.shadeName,
            shadeLabel: variant.shadeLabel,
            swatchHex: variant.swatchHex,
            stockQty: variant.stockQty,
            priceOverride: variant.priceOverride
          }
        });
      } else {
        await tx.productVariant.create({
          data: {
            product: {
              connect: { id: productId }
            },
            sku: variant.sku,
            shadeName: variant.shadeName,
            shadeLabel: variant.shadeLabel,
            swatchHex: variant.swatchHex,
            stockQty: variant.stockQty,
            priceOverride: variant.priceOverride
          }
        });
      }
    }
  });

  await deleteBlobUrls(removedImages.map((image) => image.path));

  return {
    id: productId,
    slug: input.slug
  };
}

export async function archiveAdminProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, status: true }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: "ARCHIVED"
    }
  });

  return {
    id: product.id,
    slug: product.slug
  };
}
