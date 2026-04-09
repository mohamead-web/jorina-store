import Form from "next/form";

import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { Link } from "@/lib/i18n/navigation";
import { getSmartSearchResults } from "@/lib/services/search";
import { getWishlistIds } from "@/lib/services/wishlist";

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const { q } = await searchParams;
  const user = await getCurrentUser();
  const [results, favoriteIds] = await Promise.all([
    getSmartSearchResults(typedLocale, q ?? ""),
    getWishlistIds(user?.id)
  ]);
  const hasQuery = results.query.length > 0;

  const heading = hasQuery
    ? results.isFallback
      ? {
          eyebrow: typedLocale === "ar" ? "أقرب النتائج" : "Closest matches",
          title:
            typedLocale === "ar"
              ? `نتائج قريبة لـ ${results.query}`
              : `Closest results for ${results.query}`,
          description:
            typedLocale === "ar"
              ? "لم نجد تطابقًا مباشرًا، لذلك عرضنا لك أقرب المنتجات والفئات المرتبطة بالاستعلام."
              : "We did not find a direct match, so we surfaced the closest related products and categories."
        }
      : {
          eyebrow: typedLocale === "ar" ? "البحث" : "Search",
          title:
            typedLocale === "ar"
              ? `نتائج البحث عن ${results.query}`
              : `Search results for ${results.query}`,
          description:
            typedLocale === "ar"
              ? "نتائج مرتبة بذكاء عبر أسماء المنتجات، الفئات، الشيدات والوصف المختصر."
              : "Intelligently ranked results across product names, categories, shades, and short descriptions."
        }
    : {
        eyebrow: typedLocale === "ar" ? "البحث" : "Search",
        title:
          typedLocale === "ar" ? "ابحثي داخل المجموعة" : "Search within the collection",
        description:
          typedLocale === "ar"
            ? "اكتبي اسم منتج، فئة أو shade لتظهر لك اقتراحات هادئة ونتائج أقرب لما تبحثين عنه."
            : "Type a product, category, or shade to surface calm suggestions and closer matches."
      };

  return (
    <div className="page-section py-10">
      <div className="section-container">
        <Reveal>
          <SectionHeading
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
        </Reveal>

        <Reveal delay={0.06}>
          <Form
            action={`/${typedLocale}/search`}
            scroll={false}
            className="premium-card mt-8 flex flex-col gap-3 p-4 sm:flex-row"
          >
            <input
              type="text"
              name="q"
              defaultValue={results.query}
              placeholder={
                typedLocale === "ar"
                  ? "ابحثي عن منتج، فئة أو shade"
                  : "Search for a product, category, or shade"
              }
              className="h-12 flex-1 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base sm:text-sm"
            />
            <button className="h-12 rounded-full bg-text px-5 text-sm text-white sm:min-w-32">
              {typedLocale === "ar" ? "بحث" : "Search"}
            </button>
          </Form>
        </Reveal>

        {results.categories.length > 0 ? (
          <Reveal delay={0.1}>
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-[2rem] text-text">
                  {typedLocale === "ar" ? "فئات قريبة" : "Related categories"}
                </h2>
                <p className="text-sm text-text-soft">
                  {typedLocale === "ar"
                    ? "اختصري الطريق إلى ما يناسبك."
                    : "Jump directly into the closest category."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {results.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={category.href}
                    className="rounded-[1.45rem] border border-black/6 bg-white/90 px-5 py-5 shadow-[0_18px_36px_-30px_rgba(17,12,12,0.24)] transition hover:border-black/10 hover:shadow-[0_22px_46px_-30px_rgba(17,12,12,0.28)]"
                  >
                    <p
                      className={
                        typedLocale === "ar"
                          ? "font-ui text-[1.12rem] text-text"
                          : "font-display text-[1.35rem] text-text"
                      }
                    >
                      {category.name}
                    </p>
                    {category.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-soft">
                        {category.description}
                      </p>
                    ) : null}
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-muted">
                      {typedLocale === "ar"
                        ? `${category.productCount} منتج`
                        : `${category.productCount} products`}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        ) : null}

        <div className="mt-8">
          {results.products.length > 0 ? (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-[2rem] text-text">
                  {hasQuery
                    ? results.isFallback
                      ? typedLocale === "ar"
                        ? "أقرب المنتجات"
                        : "Closest products"
                      : typedLocale === "ar"
                        ? "المنتجات"
                        : "Products"
                    : typedLocale === "ar"
                      ? "قد يعجبك أيضًا"
                      : "You may also like"}
                </h2>
                <p className="text-sm text-text-soft">
                  {typedLocale === "ar"
                    ? `${results.products.length} نتيجة`
                    : `${results.products.length} results`}
                </p>
              </div>

              <ProductGrid
                locale={typedLocale}
                products={results.products}
                favoriteIds={favoriteIds}
              />
            </>
          ) : (
            <EmptyState
              title={
                typedLocale === "ar"
                  ? "لم نجد ما يطابق بحثك"
                  : "We couldn't find a match"
              }
              body={
                typedLocale === "ar"
                  ? "جرّبي اسم منتج مختلف، اسم فئة، أو اذهبي إلى المتجر الكامل لمشاهدة المجموعة كلها."
                  : "Try a different product name, a category, or browse the full shop to see the whole collection."
              }
              ctaLabel={typedLocale === "ar" ? "الذهاب إلى المتجر" : "Go to shop"}
              ctaHref="/shop"
            />
          )}
        </div>
      </div>
    </div>
  );
}
