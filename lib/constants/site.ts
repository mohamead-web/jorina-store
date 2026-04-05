export const siteConfig = {
  name: "JORINA",
  description:
    "Luxury cosmetics brand experience with an Arabic-first, editorial commerce journey.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  defaultLocale: "ar",
  defaultCountry: "EG",
  contactEmail: "hello@jorina.com",
  contactPhone: "+20 10 000 0000",
  socialLinks: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
  },
};

export const mainNavigation = [
  { href: "/", labelKey: "navigation.home" },
  { href: "/shop", labelKey: "navigation.shop" },
  { href: "/categories", labelKey: "navigation.categories" },
  { href: "/new-arrivals", labelKey: "navigation.newArrivals" },
  { href: "/best-sellers", labelKey: "navigation.bestSellers" },
  { href: "/offers", labelKey: "navigation.offers" },
  { href: "/about", labelKey: "navigation.about" },
  { href: "/contact", labelKey: "navigation.contact" }
] as const;

export const accountNavigation = [
  { href: "/account", labelKey: "account.overview" },
  { href: "/account/orders", labelKey: "account.orders" },
  { href: "/account/returns", labelKey: "account.returns" },
  { href: "/account/favorites", labelKey: "account.favorites" },
  { href: "/account/addresses", labelKey: "account.addresses" },
  { href: "/account/settings", labelKey: "account.settings" }
] as const;

export const footerNavigation = {
  brand: [
    { href: "/about", labelKey: "navigation.about" },
    { href: "/faq", labelKey: "navigation.faq" },
    { href: "/contact", labelKey: "navigation.contact" }
  ],
  policy: [
    { href: "/shipping-delivery", labelKey: "navigation.shipping" },
    { href: "/returns-policy", labelKey: "navigation.returnsPolicy" },
    { href: "/privacy-policy", labelKey: "navigation.privacyPolicy" },
    { href: "/terms", labelKey: "navigation.terms" }
  ]
};
