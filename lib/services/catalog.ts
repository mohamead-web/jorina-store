import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AppLocale, ProductFilters } from "@/types/domain";

function pickTranslation<T extends { localeCode: string }>(
  items: T[],
  locale: AppLocale
) {
  return items.find((item) => item.localeCode === locale) ?? items[0];
}

function pickPrimaryImage<T extends { isPrimary: boolean; sortOrder: number }>(
  items: T[]
) {
  return [...items].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder
  )[0];
}

const productInclude = {
  translations: true,
  images: true,
  variants: true,
  productCategories: {
    include: {
      category: {
        include: {
          translations: true
        }
      }
    }
  },
  collections: {
    include: {
      collection: {
        include: {
          translations: true
        }
      }
    }
  }
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function mapProductCard(product: ProductWithRelations, locale: AppLocale) {
  const translation = pickTranslation(product.translations, locale);
  const image = pickPrimaryImage(product.images);
  const firstCategory = product.productCategories[0]?.category;
  const categoryTranslation = firstCategory
    ? pickTranslation(firstCategory.translations, locale)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: translation?.name ?? product.slug,
    shortDescription: translation?.shortDescription ?? "",
    price: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    imagePath: image?.path ?? "/assets/products/placeholder.svg",
    imageAlt: image?.alt ?? translation?.name ?? product.slug,
    categoryName: categoryTranslation?.name ?? null,
    inStock: product.totalStock > 0,
    variantCount: product.variants.length
  };
}

function mapProductDetail(product: ProductWithRelations, locale: AppLocale) {
  const translation = pickTranslation(product.translations, locale);

  return {
    ...mapProductCard(product, locale),
    longDescription: translation?.longDescription ?? "",
    ingredients: translation?.ingredients ?? "",
    howToUse: translation?.howToUse ?? "",
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        path: image.path,
        alt: image.alt
      })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      shadeName: variant.shadeName,
      shadeLabel: variant.shadeLabel,
      swatchHex: variant.swatchHex,
      price: Number(variant.priceOverride ?? product.basePrice),
      stockQty: variant.stockQty
    })),
    categories: product.productCategories.map((entry) => ({
      slug: entry.category.slug,
      name: pickTranslation(entry.category.translations, locale)?.name ?? entry.category.slug
    })),
    collections: product.collections.map((entry) => ({
      slug: entry.collection.slug,
      title:
        pickTranslation(entry.collection.translations, locale)?.title ??
        entry.collection.slug
    }))
  };
}

function buildWhere(
  locale: AppLocale,
  filters: ProductFilters
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE"
  };

  if (filters.query) {
    where.translations = {
      some: {
        localeCode: locale,
        OR: [
          {
            name: {
              contains: filters.query,
              mode: "insensitive"
            }
          },
          {
            shortDescription: {
              contains: filters.query,
              mode: "insensitive"
            }
          }
        ]
      }
    };
  }

  if (filters.category) {
    where.productCategories = {
      some: {
        category: {
          slug: filters.category
        }
      }
    };
  }

  if (filters.collection) {
    where.collections = {
      some: {
        collection: {
          slug: filters.collection
        }
      }
    };
  }

  return where;
}

function buildOrderBy(
  filters: ProductFilters
): Prisma.ProductOrderByWithRelationInput {
  switch (filters.sort) {
    case "priceAsc":
      return { basePrice: "asc" };
    case "priceDesc":
      return { basePrice: "desc" };
    case "newest":
      return { createdAt: "desc" };
    default:
      return { updatedAt: "desc" };
  }
}

export const getHomepageData = cache(async (locale: AppLocale) => {
  const [categories, featured, bestSellers, newArrivals] = await Promise.all([
    prisma.category.findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" }
    }),
    getCollectionProducts(locale, "featured"),
    getCollectionProducts(locale, "best-sellers"),
    getCollectionProducts(locale, "new-arrivals")
  ]);

  return {
    categories: categories.map((category) => ({
      slug: category.slug,
      imagePath: category.imagePath,
      name: pickTranslation(category.translations, locale)?.name ?? category.slug,
      description: pickTranslation(category.translations, locale)?.description ?? ""
    })),
    featured,
    bestSellers,
    newArrivals
  };
});

export const getProducts = cache(
  async (locale: AppLocale, filters: ProductFilters = {}) => {
    const products = await prisma.product.findMany({
      where: buildWhere(locale, filters),
      include: productInclude,
      orderBy: buildOrderBy(filters)
    });

    return products.map((product) => mapProductCard(product, locale));
  }
);

export const getCollectionProducts = cache(async (locale: AppLocale, slug: string) => {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      collections: {
        some: {
          collection: {
            slug
          }
        }
      }
    },
    include: productInclude,
    orderBy: { updatedAt: "desc" }
  });

  return products.map((product) => mapProductCard(product, locale));
});

export const getCategories = cache(async (locale: AppLocale) => {
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      _count: {
        select: { productCategories: true }
      }
    },
    orderBy: { sortOrder: "asc" }
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    imagePath: category.imagePath,
    name: pickTranslation(category.translations, locale)?.name ?? category.slug,
    description: pickTranslation(category.translations, locale)?.description ?? "",
    productCount: category._count.productCategories
  }));
});

export const getCategoryBySlug = cache(async (locale: AppLocale, slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: true,
      productCategories: {
        include: {
          product: {
            include: productInclude
          }
        }
      }
    }
  });

  if (!category) {
    return null;
  }

  return {
    slug: category.slug,
    imagePath: category.imagePath,
    name: pickTranslation(category.translations, locale)?.name ?? category.slug,
    description: pickTranslation(category.translations, locale)?.description ?? "",
    seoTitle: pickTranslation(category.translations, locale)?.seoTitle ?? null,
    seoDescription:
      pickTranslation(category.translations, locale)?.seoDescription ?? null,
    products: category.productCategories
      .filter((entry) => entry.product.status === "ACTIVE")
      .map((entry) => mapProductCard(entry.product, locale))
  };
});

export const getProductBySlug = cache(async (locale: AppLocale, slug: string) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE"
    },
    include: productInclude
  });

  if (!product) {
    return null;
  }

  const relatedCategorySlug = product.productCategories[0]?.category.slug;
  const relatedProducts = relatedCategorySlug
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          slug: { not: product.slug },
          productCategories: {
            some: {
              category: {
                slug: relatedCategorySlug
              }
            }
          }
        },
        include: productInclude,
        take: 4
      })
    : [];

  return {
    product: mapProductDetail(product, locale),
    relatedProducts: relatedProducts.map((entry) => mapProductCard(entry, locale))
  };
});
