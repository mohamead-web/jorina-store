export type AppLocale = "ar" | "en";
export type AppCountry = "EG";
export type AppCurrency = "EGP";

export type ProductSort = "featured" | "newest" | "priceAsc" | "priceDesc";

export type ProductFilters = {
  query?: string;
  category?: string;
  collection?: string;
  sort?: ProductSort;
};
