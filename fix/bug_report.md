# 🐛 JORINA — Full Bug Report

Complete code audit results organized by severity.

---

## 🔴 Critical Bugs (Application-Breaking)

### BUG-01: Middleware file is misnamed — i18n routing is broken
- **File**: [proxy.ts](file:///c:/Users/IT-PC/Desktop/jorina%20bac/proxy.ts)
- **Problem**: Next.js expects the middleware file to be named `middleware.ts` at the project root. The file is currently named `proxy.ts`, which means **Next.js completely ignores it**. The `next-intl` middleware (locale detection, redirect from `/` to `/ar`) never executes.
- **Impact**: Locale redirects, `x-pathname` header injection, and automatic locale prefix handling may not work. Users accessing `/` won't be redirected to `/ar`.
- **Fix**: Rename `proxy.ts` → `middleware.ts`

---

### BUG-02: Missing OG/Twitter image — SEO metadata points to non-existent file
- **File**: [metadata.ts](file:///c:/Users/IT-PC/Desktop/jorina%20bac/lib/seo/metadata.ts#L31-L42)
- **Problem**: The metadata builder references `/brand/jorina-logo.jpeg` for OpenGraph and Twitter cards. But `public/brand/` only contains `logo.png` and `logo-cropped.png` — there is **no `jorina-logo.jpeg`** file.
- **Impact**: All social media sharing previews (Facebook, Twitter, WhatsApp, Telegram) show broken/missing images across all pages.
- **Fix**: Either add the `jorina-logo.jpeg` file to `public/brand/`, or update the path in `metadata.ts` to reference `logo.png`

---

### BUG-03: No currency conversion — same price shown in EGP and SDG
- **File**: [catalog.ts](file:///c:/Users/IT-PC/Desktop/jorina%20bac/lib/services/catalog.ts), [utils/index.ts](file:///c:/Users/IT-PC/Desktop/jorina%20bac/lib/utils/index.ts)
- **Problem**: Products have a single `basePrice` in the database. The `formatCurrency()` function simply formats the **same number** with a different currency symbol based on user preference. A product priced at `500` displays as both `500 EGP` (≈$10) and `500 SDG` (≈$0.80) — these are wildly different real-world values.
- **Impact**: Either Egyptian or Sudanese customers are paying the wrong price. This is a **business-critical pricing error**.
- **Fix**: Add a `currencyRates` table or conversion logic, or store separate prices per country in `ProductVariant`

---

### BUG-04: Checkout form allows duplicate order submission
- **File**: [checkout-form.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/checkout/checkout-form.tsx#L57-L70)
- **Problem**: The `onSubmit` handler uses `startTransition` but **never sets a loading/disabled state** on the submit button. Users can click "Confirm Order" multiple times during the async operation, creating **duplicate orders**, each decrementing stock.
- **Impact**: Multiple charges on COD, duplicate stock decrements, corrupted order history.
- **Fix**: Add an `isSubmitting` state, disable the button during submission, and pass it to the `CheckoutWizard`'s external submit button as well

---

### BUG-05: Map component infinite re-render loop
- **File**: [map-component.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/ui/map-component.tsx#L29-L35)
- **Problem**: The `ChangeView` component calls `map.setView(center, zoom)` inside `useEffect` with `[center, zoom, map]` deps. When the user drags the map → `MapEvents.moveend` fires → `onLocationChange` updates parent `coords` state → new `center` prop → `ChangeView` calls `setView` again → triggers `moveend` → **infinite loop**. Due to floating point drift, coordinates never stabilize.
- **Impact**: The map freezes, browser tab becomes unresponsive, or the map jitters uncontrollably.
- **Fix**: Only call `setView` in `ChangeView` when the center change comes from external input (search/geolocation), not from user drag. Use a ref to track whether to skip the next `setView`.

---

## 🟠 Major Bugs (Feature-Breaking)

### BUG-06: MobileBottomNav "Home" icon is always active
- **File**: [mobile-bottom-nav.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/navigation/mobile-bottom-nav.tsx#L55)
- **Problem**: The active check is `pathname === item.href || pathname.startsWith(\`${item.href}/\`)`. For the Home item with `href="/"`, `pathname.startsWith("/")` is **true for every page**. The Home icon always appears highlighted.
- **Impact**: Users always see "Home" as the active navigation item regardless of current page.
- **Fix**: Special-case the home route: `item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(\`${item.href}/\`)`

---

### BUG-07: Newsletter forms do nothing
- **Files**: [footer.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/layout/footer.tsx#L22-L27), [newsletter-cta.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/newsletter-cta.tsx#L33-L42)
- **Problem**: Both newsletter subscription forms have `<form>` with `<Button type="submit">` but **no `onSubmit` handler** and **no `action` attribute**. Clicking "Subscribe" triggers a full page reload that does nothing.
- **Impact**: Users think they subscribed but nothing is saved. No feedback to the user.
- **Fix**: Either implement a server action to save newsletter subscriptions, or at minimum add `e.preventDefault()` and show a toast confirmation

---

### BUG-08: ProductCard shares isPending state between cart and wishlist
- **File**: [product-card.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/shop/product-card.tsx#L44)
- **Problem**: One `isPending` state is shared between the "Add to Cart" button and the "Wishlist" heart button. Clicking either one disables **both** buttons.
- **Impact**: Poor UX — user clicks wishlist and can't add to cart until the operation completes, and vice versa.
- **Fix**: Use separate state variables: `isCartPending` and `isWishlistPending`

---

### BUG-09: Same shared isPending state in ProductBuyBox
- **File**: [product-buybox.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/product/product-buybox.tsx#L50)
- **Problem**: Identical issue to BUG-08. One `isPending` controls both add-to-cart and wishlist toggle in the product detail page.
- **Impact**: Same as BUG-08 — more impactful here because the product detail page is a key conversion point.
- **Fix**: Separate `isCartPending` and `isWishlistPending` states

---

### BUG-10: CartLineItem local quantity state drifts from server state
- **File**: [cart-line-item.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/checkout/cart-line-item.tsx#L34)
- **Problem**: `useState(item.quantity)` initializes local quantity from props, but after `router.refresh()` updates the page, React **preserves the old state** (same component key = `item.id`). If the server action fails silently or the stock was adjusted, the displayed quantity won't reflect the real value.
- **Impact**: UI shows wrong quantity after failures or concurrent edits.
- **Fix**: Use `useEffect` to sync `quantity` when `item.quantity` changes, or derive it directly from props

---

### BUG-11: Admin layout is not responsive — unusable on mobile
- **File**: [admin layout.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/app/%5Blocale%5D/%28admin%29/layout.tsx)
- **Problem**: Uses a fixed `w-64` sidebar and `ps-64` padding. No hamburger menu, no responsive behavior. On screens smaller than ~768px, the sidebar covers most of the screen and the main content is pushed entirely off-screen.
- **Impact**: Admin dashboard is completely unusable on tablets and phones.
- **Fix**: Add responsive sidebar with toggle/drawer pattern for mobile

---

### BUG-12: Error page is hardcoded in Arabic — English users see Arabic error text
- **File**: [error.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/app/%5Blocale%5D/error.tsx)
- **Problem**: The error boundary has hardcoded Arabic text: `"حدث خلل غير متوقع"`, `"إعادة المحاولة"`, etc. Error boundaries are `"use client"` components that don't receive `params`, so the locale is unknown.
- **Impact**: English-speaking users see Arabic error messages exclusively.
- **Fix**: Parse the locale from `window.location.pathname` on the client, or use a bilingual display

---

### BUG-13: ReturnRequestForm and AddressManager don't handle server action errors
- **Files**: [return-request-form.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/account/return-request-form.tsx#L29-L41), [address-manager.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/account/address-manager.tsx#L114-L123)
- **Problem**: Both forms call server actions inside `startTransition` with **no try/catch**. The actions (`requestReturnAction`, `saveAddressAction`, `deleteAddressAction`) throw errors on auth failure. An unhandled throw inside `startTransition` crashes React.
- **Impact**: If the session expires during form usage, the entire page crashes with an unhandled error instead of showing a friendly message.
- **Fix**: Wrap the server action calls in try/catch and show error toasts

---

## 🟡 Medium Bugs (UX/Logic Issues)

### BUG-14: Desktop shop filter form uses full page reload instead of client-side navigation
- **File**: [shop/page.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/app/%5Blocale%5D/%28shop%29/shop/page.tsx#L78-L115)
- **Problem**: The desktop filter `<form>` for search/category/sort submits as a native HTML GET form, causing a **full-page hard reload**. The mobile filters use `router.push()` for smooth client-side transitions.
- **Impact**: Inconsistent UX: mobile users get smooth filtering, desktop users see a flash/reload on every filter change.
- **Fix**: Convert to client-side form handling with `router.push()` like the mobile filters, or use `action` attribute with the current page path

---

### BUG-15: Footer policy column has misleading header
- **File**: [footer.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/layout/footer.tsx#L42-L43)
- **Problem**: The second footer column header reads `{t("navigation.privacyPolicy")}` which translates to "الخصوصية" / "Privacy Policy". But the column contains ALL policy links: Shipping, Returns, Privacy, Terms.
- **Impact**: The section header is misleading — it says "Privacy Policy" but lists 4 different policy pages.
- **Fix**: Use a logical group header like "السياسات" / "Policies" or "الدعم" / "Support"

---

### BUG-16: SmoothScrollProvider uses useSearchParams without Suspense boundary
- **File**: [smooth-scroll-provider.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/layout/smooth-scroll-provider.tsx#L14)
- **Problem**: `useSearchParams()` in Next.js App Router requires a `<Suspense>` boundary above the component during static rendering. The provider wraps the entire app without such a boundary.
- **Impact**: Can cause hydration warnings and potential SSR failures during static generation.
- **Fix**: Wrap the provider in a `<Suspense fallback={null}>` or move `useSearchParams` to a child component wrapped in Suspense

---

### BUG-17: LocationModal useEffect missing dependencies
- **File**: [location-modal.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/ui/location-modal.tsx#L61-L65)
- **Problem**: `useEffect(() => { if (isOpen) fetchAddress(coords.lat, coords.lng); }, [isOpen])` — the dependency array is missing `coords.lat`, `coords.lng`, and `fetchAddress`. When `coords` changes from search or geolocation, this effect won't re-run.
- **Impact**: This is mitigated because `fetchAddress` is called separately in those handlers, but it violates React hooks rules and could cause subtle stale-closure bugs.
- **Fix**: Add the missing dependencies or restructure the effect

---

### BUG-18: Nominatim API User-Agent header is ignored in browser
- **File**: [location-service.ts](file:///c:/Users/IT-PC/Desktop/jorina%20bac/lib/services/location-service.ts#L15-L19)
- **Problem**: `User-Agent` is a [forbidden header](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name) in browser fetch requests. The header `"User-Agent": "Jorina-Luxury-Cosmetics-App"` is silently ignored. Nominatim may rate-limit or block requests without a proper User-Agent.
- **Impact**: Geocoding requests may fail in production under load. No rate-limiting protection either.
- **Fix**: Proxy Nominatim calls through a Next.js API route where server-side `User-Agent` headers work, and add request debouncing

---

## 🔵 Minor Issues (Code Quality / Dead Code)

### BUG-19: `openingY` variable computed but never used in HeroSection
- **File**: [hero-section.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/hero-section.tsx#L27)
- **Problem**: `const openingY = useTransform(scrollY, [0, 220], [0, -26])` is computed but never passed to any style prop.
- **Impact**: Wasted computation on every scroll frame; intended parallax Y-offset effect is missing from the hero animation.

### BUG-20: `detailItems` defined but never rendered in EditorialHeroContent
- **File**: [editorial-hero-content.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/editorial-hero-content.tsx#L32-L35)
- **Problem**: `const detailItems = { ar: [...], en: [...] }` is defined at module level but never used in the JSX. Dead code.

### BUG-21: `mobileSubheadline` exists in copy but is never rendered
- **File**: [editorial-hero-content.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/editorial-hero-content.tsx#L13-L14)
- **Problem**: Both `ar` and `en` hero copies include a `mobileSubheadline` field, but the component only renders `copy.subheadline`. The shorter mobile-friendly text is never shown.
- **Impact**: Mobile users see the longer `subheadline` text which may be too long for small screens.

### BUG-22: OpeningSequence accepts `locale` prop but never uses it
- **File**: [opening-sequence.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/opening-sequence.tsx#L7)
- **Problem**: The component signature requires `locale: "ar" | "en"` but the prop is never referenced in the component body.

### BUG-23: CategoryStrip uses plain `<img>` instead of Next.js `<Image>`
- **File**: [category-strip.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/category-strip.tsx#L95)
- **Problem**: `<img src={theme.bgImage} alt="" className="..." />` bypasses Next.js image optimization (lazy loading, WebP conversion, responsive srcsets).
- **Impact**: Larger download sizes and slower page loads for category images.

### BUG-24: `AmbientBackdrop` component is empty and unused
- **File**: [hero-section.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/components/home/hero-section.tsx#L8-L10)
- **Problem**: `function AmbientBackdrop() { return null; }` — defined but never called.

### BUG-25: Admin layout uses `next/link` instead of i18n-aware Link
- **File**: [admin layout.tsx](file:///c:/Users/IT-PC/Desktop/jorina%20bac/app/%5Blocale%5D/%28admin%29/layout.tsx#L2)
- **Problem**: Admin layout imports `Link from "next/link"` and manually builds URLs with `/${locale}${link.href}`. The rest of the app uses `Link from "@/lib/i18n/navigation"` for locale-aware routing.
- **Impact**: Inconsistent behavior; would break if the i18n URL strategy changes.

---

## Summary Table

| ID | Severity | Category | Description |
|---|---|---|---|
| BUG-01 | 🔴 Critical | Config | Middleware file misnamed `proxy.ts` instead of `middleware.ts` |
| BUG-02 | 🔴 Critical | SEO | OG image references non-existent `jorina-logo.jpeg` |
| BUG-03 | 🔴 Critical | Business Logic | No currency conversion — same price for EGP and SDG |
| BUG-04 | 🔴 Critical | Checkout | Double-click creates duplicate orders (no submit guard) |
| BUG-05 | 🔴 Critical | UI/Map | Map component causes infinite re-render loop |
| BUG-06 | 🟠 Major | Navigation | Home icon always highlighted in bottom nav |
| BUG-07 | 🟠 Major | Feature | Newsletter forms submit but do nothing |
| BUG-08 | 🟠 Major | UX | ProductCard shared pending state blocks both actions |
| BUG-09 | 🟠 Major | UX | ProductBuyBox same shared pending state issue |
| BUG-10 | 🟠 Major | State | Cart quantity display drifts from server state |
| BUG-11 | 🟠 Major | Responsive | Admin layout completely broken on mobile |
| BUG-12 | 🟠 Major | i18n | Error page hardcoded in Arabic for all users |
| BUG-13 | 🟠 Major | Error Handling | Return/Address forms crash on server action errors |
| BUG-14 | 🟡 Medium | UX | Desktop shop filters cause full page reload |
| BUG-15 | 🟡 Medium | Content | Footer column header is misleading |
| BUG-16 | 🟡 Medium | SSR | useSearchParams without Suspense boundary |
| BUG-17 | 🟡 Medium | React Rules | useEffect missing dependencies in LocationModal |
| BUG-18 | 🟡 Medium | API | Nominatim User-Agent header ignored in browser |
| BUG-19 | 🔵 Minor | Dead Code | `openingY` computed but never applied |
| BUG-20 | 🔵 Minor | Dead Code | `detailItems` defined but never rendered |
| BUG-21 | 🔵 Minor | Dead Code | `mobileSubheadline` field never used |
| BUG-22 | 🔵 Minor | Dead Code | `locale` prop unused in OpeningSequence |
| BUG-23 | 🔵 Minor | Performance | Plain `<img>` instead of Next.js `<Image>` |
| BUG-24 | 🔵 Minor | Dead Code | `AmbientBackdrop` component is empty/unused |
| BUG-25 | 🔵 Minor | Consistency | Admin uses `next/link` instead of i18n Link |

**Total: 25 bugs found** — 5 Critical, 8 Major, 5 Medium, 7 Minor
