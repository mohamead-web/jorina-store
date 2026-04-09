import type { AppLocale } from "@/types/domain";

export type SearchProductPreview = {
  id: string;
  slug: string;
  href: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  imagePath: string;
  imageAlt: string;
  categoryName: string | null;
  inStock: boolean;
  matchedLocale: AppLocale;
};

export type SearchCategoryPreview = {
  slug: string;
  href: string;
  name: string;
  description: string;
  productCount: number;
  matchedLocale: AppLocale;
};

export type SmartSearchResultSet = {
  query: string;
  normalizedQuery: string;
  products: SearchProductPreview[];
  categories: SearchCategoryPreview[];
  isFallback: boolean;
};
