export type AppLocale = "ar" | "en";
export type AppCountry = "EG" | "SD";
export type AppCurrency = "EGP" | "SDG";

export type ProductSort = "featured" | "newest" | "priceAsc" | "priceDesc";

export type ProductFilters = {
  query?: string;
  category?: string;
  collection?: string;
  sort?: ProductSort;
};
