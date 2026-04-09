import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AppLocale } from "@/types/domain";
import type {
  SearchCategoryPreview,
  SearchProductPreview,
  SmartSearchResultSet
} from "@/types/search";

const searchInclude = {
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

type SearchProductRecord = Prisma.ProductGetPayload<{
  include: typeof searchInclude;
}>;

type SearchCategorySource = {
  slug: string;
  translations: Array<{
    localeCode: AppLocale;
    name: string;
    description: string | null;
  }>;
  productCount: number;
};

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

const getActiveSearchProducts = cache(async () => {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE"
    },
    include: searchInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });
});

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ـ/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchText(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token.length > 0);
}

function getMatchScore(field: string, query: string, tokens: string[]) {
  if (!field || !query) {
    return 0;
  }

  if (field === query) {
    return 120;
  }

  const matchedTokens = tokens.filter((token) => field.includes(token)).length;

  if (matchedTokens === 0 && !field.includes(query)) {
    return 0;
  }

  let score = matchedTokens * 14;

  if (tokens.length > 1 && matchedTokens === tokens.length) {
    score += 26;
  }

  if (field.includes(query)) {
    score += 32;
  }

  if (field.startsWith(query)) {
    score += 24;
  }

  return score;
}

function getBigrams(value: string) {
  if (value.length < 2) {
    return value ? [value] : [];
  }

  const bigrams: string[] = [];

  for (let index = 0; index < value.length - 1; index += 1) {
    bigrams.push(value.slice(index, index + 2));
  }

  return bigrams;
}

function getSimilarityScore(value: string, query: string) {
  if (!value || !query) {
    return 0;
  }

  if (value === query) {
    return 1;
  }

  if (value.includes(query) || query.includes(value)) {
    return 0.92;
  }

  const valueBigrams = getBigrams(value);
  const queryBigrams = getBigrams(query);

  if (valueBigrams.length === 0 || queryBigrams.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();

  for (const bigram of valueBigrams) {
    counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
  }

  let intersection = 0;

  for (const bigram of queryBigrams) {
    const remaining = counts.get(bigram) ?? 0;

    if (remaining > 0) {
      intersection += 1;
      counts.set(bigram, remaining - 1);
    }
  }

  return (2 * intersection) / (valueBigrams.length + queryBigrams.length);
}

function getProductPreview(
  product: SearchProductRecord,
  locale: AppLocale,
  matchedLocale: AppLocale
): SearchProductPreview {
  const translation = pickTranslation(product.translations, locale);
  const image = pickPrimaryImage(product.images);
  const firstCategory = product.productCategories[0]?.category;
  const categoryTranslation = firstCategory
    ? pickTranslation(firstCategory.translations, locale)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    href: `/products/${product.slug}`,
    name: translation?.name ?? product.slug,
    shortDescription: translation?.shortDescription ?? "",
    price: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    imagePath: image?.path ?? "/assets/products/placeholder.svg",
    imageAlt: image?.alt ?? translation?.name ?? product.slug,
    categoryName: categoryTranslation?.name ?? null,
    inStock: product.totalStock > 0,
    matchedLocale
  };
}

function getCategoryPreview(
  category: SearchCategorySource,
  locale: AppLocale,
  matchedLocale: AppLocale
): SearchCategoryPreview {
  const translation = pickTranslation(category.translations, locale);

  return {
    slug: category.slug,
    href: `/categories/${category.slug}`,
    name: translation?.name ?? category.slug,
    description: translation?.description ?? "",
    productCount: category.productCount,
    matchedLocale
  };
}

function buildCategorySources(products: SearchProductRecord[]) {
  const categoryMap = new Map<string, SearchCategorySource>();

  for (const product of products) {
    for (const entry of product.productCategories) {
      const existing = categoryMap.get(entry.category.slug);

      if (existing) {
        existing.productCount += 1;
        continue;
      }

      categoryMap.set(entry.category.slug, {
        slug: entry.category.slug,
        translations: entry.category.translations.map((translation) => ({
          localeCode: translation.localeCode as AppLocale,
          name: translation.name,
          description: translation.description ?? null
        })),
        productCount: 1
      });
    }
  }

  return [...categoryMap.values()];
}

function getProductDirectScore(
  product: SearchProductRecord,
  locale: AppLocale,
  query: string,
  tokens: string[]
) {
  let score = 0;
  let matchedLocale: AppLocale = locale;
  let bestNameScore = 0;

  for (const translation of product.translations) {
    const localeCode = translation.localeCode as AppLocale;
    const localeBoost = localeCode === locale ? 14 : 4;
    const nameScore = getMatchScore(normalizeSearchText(translation.name), query, tokens);
    const descriptionScore = getMatchScore(
      normalizeSearchText(translation.shortDescription ?? ""),
      query,
      tokens
    );

    if (nameScore > bestNameScore) {
      bestNameScore = nameScore;
      matchedLocale = localeCode;
    }

    score += nameScore * 3 + localeBoost;
    score += descriptionScore;
  }

  const categoryScore = Math.max(
    0,
    ...product.productCategories.flatMap((entry) =>
      entry.category.translations.map((translation) =>
        getMatchScore(normalizeSearchText(translation.name), query, tokens) * 2
      )
    )
  );

  const collectionScore = Math.max(
    0,
    ...product.collections.flatMap((entry) =>
      entry.collection.translations.map((translation) =>
        getMatchScore(normalizeSearchText(translation.title), query, tokens)
      )
    )
  );

  const variantScore = Math.max(
    0,
    ...product.variants.flatMap((variant) => [
      getMatchScore(normalizeSearchText(variant.shadeName), query, tokens) * 1.5,
      getMatchScore(normalizeSearchText(variant.shadeLabel ?? ""), query, tokens) * 1.3,
      getMatchScore(normalizeSearchText(variant.sku), query, tokens)
    ])
  );

  score += categoryScore + collectionScore + variantScore;

  if (bestNameScore === 0 && score < 34) {
    return null;
  }

  return {
    score,
    matchedLocale
  };
}

function getCategoryDirectScore(
  category: SearchCategorySource,
  locale: AppLocale,
  query: string,
  tokens: string[]
) {
  let score = 0;
  let matchedLocale: AppLocale = locale;
  let bestNameScore = 0;

  for (const translation of category.translations) {
    const localeCode = translation.localeCode as AppLocale;
    const localeBoost = localeCode === locale ? 10 : 2;
    const nameScore = getMatchScore(normalizeSearchText(translation.name), query, tokens);
    const descriptionScore = getMatchScore(
      normalizeSearchText(translation.description ?? ""),
      query,
      tokens
    );

    if (nameScore > bestNameScore) {
      bestNameScore = nameScore;
      matchedLocale = localeCode;
    }

    score += nameScore * 2 + localeBoost;
    score += Math.floor(descriptionScore * 0.65);
  }

  if (bestNameScore === 0 && score < 22) {
    return null;
  }

  return {
    score,
    matchedLocale
  };
}

function getProductFallbackScore(product: SearchProductRecord, query: string) {
  return Math.max(
    ...product.translations.map(
      (translation) => getSimilarityScore(normalizeSearchText(translation.name), query) * 1.2
    ),
    ...product.translations.map((translation) =>
      getSimilarityScore(normalizeSearchText(translation.shortDescription ?? ""), query) * 0.4
    ),
    ...product.productCategories.flatMap((entry) =>
      entry.category.translations.map((translation) =>
        getSimilarityScore(normalizeSearchText(translation.name), query) * 0.82
      )
    ),
    ...product.collections.flatMap((entry) =>
      entry.collection.translations.map((translation) =>
        getSimilarityScore(normalizeSearchText(translation.title), query) * 0.72
      )
    ),
    ...product.variants.flatMap((variant) => [
      getSimilarityScore(normalizeSearchText(variant.shadeName), query) * 0.94,
      getSimilarityScore(normalizeSearchText(variant.shadeLabel ?? ""), query) * 0.86
    ]),
    0
  );
}

function getCategoryFallbackScore(category: SearchCategorySource, query: string) {
  return Math.max(
    ...category.translations.map(
      (translation) => getSimilarityScore(normalizeSearchText(translation.name), query) * 1.08
    ),
    ...category.translations.map((translation) =>
      getSimilarityScore(normalizeSearchText(translation.description ?? ""), query) * 0.42
    ),
    0
  );
}

function sortRecommendations(products: SearchProductRecord[]) {
  return [...products].sort((left, right) => {
    const leftFeatured = left.collections.some(
      (entry) => entry.collection.slug === "featured"
    );
    const rightFeatured = right.collections.some(
      (entry) => entry.collection.slug === "featured"
    );

    return (
      Number(rightFeatured) - Number(leftFeatured) ||
      Number(right.totalStock > 0) - Number(left.totalStock > 0) ||
      right.updatedAt.getTime() - left.updatedAt.getTime()
    );
  });
}

function buildSearchResultSet(
  products: SearchProductRecord[],
  locale: AppLocale,
  rawQuery: string,
  options: {
    productLimit?: number;
    categoryLimit?: number;
  } = {}
): SmartSearchResultSet {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeSearchText(query);
  const categorySources = buildCategorySources(products);

  if (!normalizedQuery) {
    const recommendations = sortRecommendations(products).slice(0, options.productLimit ?? 6);

    return {
      query,
      normalizedQuery,
      products: recommendations.map((product) => getProductPreview(product, locale, locale)),
      categories: [],
      isFallback: false
    };
  }

  const directProducts = products
    .map((product) => {
      const match = getProductDirectScore(product, locale, normalizedQuery, tokens);

      if (!match) {
        return null;
      }

      return {
        score: match.score,
        preview: getProductPreview(product, locale, match.matchedLocale)
      };
    })
    .filter((item): item is { score: number; preview: SearchProductPreview } => Boolean(item))
    .sort((left, right) => right.score - left.score);

  const directCategories = categorySources
    .map((category) => {
      const match = getCategoryDirectScore(category, locale, normalizedQuery, tokens);

      if (!match) {
        return null;
      }

      return {
        score: match.score,
        preview: getCategoryPreview(category, locale, match.matchedLocale)
      };
    })
    .filter((item): item is { score: number; preview: SearchCategoryPreview } => Boolean(item))
    .sort((left, right) => right.score - left.score);

  const productLimit = options.productLimit ?? directProducts.length;
  const categoryLimit = options.categoryLimit ?? directCategories.length;

  if (directProducts.length > 0 || directCategories.length > 0) {
    return {
      query,
      normalizedQuery,
      products: directProducts.slice(0, productLimit).map((item) => item.preview),
      categories: directCategories.slice(0, categoryLimit).map((item) => item.preview),
      isFallback: false
    };
  }

  const fallbackProducts = products
    .map((product) => ({
      score: getProductFallbackScore(product, normalizedQuery),
      preview: getProductPreview(product, locale, locale)
    }))
    .filter((item) => item.score >= 0.34)
    .sort((left, right) => right.score - left.score);

  const fallbackCategories = categorySources
    .map((category) => ({
      score: getCategoryFallbackScore(category, normalizedQuery),
      preview: getCategoryPreview(category, locale, locale)
    }))
    .filter((item) => item.score >= 0.36)
    .sort((left, right) => right.score - left.score);

  return {
    query,
    normalizedQuery,
    products: fallbackProducts.slice(0, productLimit).map((item) => item.preview),
    categories: fallbackCategories.slice(0, categoryLimit).map((item) => item.preview),
    isFallback: true
  };
}

export async function getSmartSearchResults(locale: AppLocale, rawQuery: string) {
  const products = await getActiveSearchProducts();

  return buildSearchResultSet(products, locale, rawQuery, {
    categoryLimit: 6
  });
}

export async function getSearchSuggestions(
  locale: AppLocale,
  rawQuery: string,
  options: {
    productLimit?: number;
    categoryLimit?: number;
  } = {}
) {
  const products = await getActiveSearchProducts();

  return buildSearchResultSet(products, locale, rawQuery, {
    productLimit: options.productLimit ?? 5,
    categoryLimit: options.categoryLimit ?? 3
  });
}
