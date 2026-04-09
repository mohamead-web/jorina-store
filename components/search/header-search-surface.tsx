"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import type { SmartSearchResultSet } from "@/types/search";

type HeaderSearchSurfaceProps = {
  open: boolean;
  locale: "ar" | "en";
  isMobileViewport: boolean;
  query: string;
  results: SmartSearchResultSet;
  isLoading: boolean;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
};

function SearchSuggestionRows({
  locale,
  query,
  results,
  isLoading,
  onSelect
}: {
  locale: "ar" | "en";
  query: string;
  results: SmartSearchResultSet;
  isLoading: boolean;
  onSelect: () => void;
}) {
  const hasQuery = query.trim().length > 0;
  const title = hasQuery
    ? results.isFallback
      ? locale === "ar"
        ? "أقرب النتائج"
        : "Closest matches"
      : locale === "ar"
        ? "المنتجات"
        : "Products"
    : locale === "ar"
      ? "قد يعجبك أيضًا"
      : "You may also like";

  const emptyTitle = hasQuery
    ? locale === "ar"
      ? "لا توجد نتائج مطابقة"
      : "No matching results"
    : locale === "ar"
      ? "ابدئي بالبحث"
      : "Start searching";

  const emptyBody = hasQuery
    ? locale === "ar"
      ? "حاولي باسم منتج، فئة، أو درجة مختلفة وسنعرض لك أقرب النتائج."
      : "Try a product name, category, or shade and we will surface the closest matches."
    : locale === "ar"
      ? "اكتبي اسم منتج، فئة أو shade لتظهر لك الاقتراحات مباشرة."
      : "Type a product, category, or shade to see instant suggestions.";

  return (
    <div className="pb-[calc(env(safe-area-inset-bottom,0px)+1.4rem)]">
      <div className="px-6 pb-2 pt-4">
        <p
          className={cn(
            "text-[0.82rem] tracking-[0.08em] text-[#a89b8f]",
            locale === "ar" ? "text-right font-ui" : "font-display uppercase"
          )}
        >
          {title}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 px-6 pt-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4" dir="ltr">
              <div className="min-w-0 flex-1 space-y-2 py-2">
                <div className="h-4 w-2/3 rounded-full bg-[#efe7de]" />
                <div className="h-3 w-full rounded-full bg-[#f5eee6]" />
                <div className="h-3 w-4/5 rounded-full bg-[#f5eee6]" />
              </div>
              <div className="h-[5.3rem] w-[4.4rem] rounded-[0.35rem] bg-[#f2ede7]" />
            </div>
          ))}
        </div>
      ) : results.products.length > 0 || results.categories.length > 0 ? (
        <div className="space-y-2">
          {results.products.length > 0 ? (
            <div className="divide-y divide-[#eee6dc] px-6">
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  onClick={onSelect}
                  className="flex items-start gap-4 py-4 transition hover:opacity-80"
                  dir="ltr"
                >
                  <div
                    className={cn(
                      "min-w-0 flex-1 pt-1",
                      locale === "ar" ? "text-right" : "text-left"
                    )}
                  >
                    <p className="line-clamp-2 font-ui text-[1rem] leading-7 text-[#271f18]">
                      {product.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[0.9rem] leading-6 text-[#7f7368]">
                      {product.shortDescription}
                    </p>
                  </div>
                  <div className="relative h-[5.3rem] w-[4.4rem] shrink-0 overflow-hidden rounded-[0.35rem] bg-[#f5f1ec]">
                    <Image
                      src={product.imagePath}
                      alt={product.imageAlt}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {results.categories.length > 0 ? (
            <div className="px-6 pt-2">
              <p
                className={cn(
                  "pb-3 text-[0.78rem] tracking-[0.08em] text-[#a89b8f]",
                  locale === "ar" ? "text-right font-ui" : "font-display uppercase"
                )}
              >
                {locale === "ar" ? "الفئات" : "Categories"}
              </p>
              <div className="divide-y divide-[#eee6dc]">
                {results.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={category.href}
                    onClick={onSelect}
                    className={cn(
                      "flex items-center justify-between gap-4 py-3 text-[#3a3029] transition hover:opacity-80",
                      locale === "ar" ? "text-right" : "text-left"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.96rem] leading-6">{category.name}</p>
                      {category.description ? (
                        <p className="mt-1 line-clamp-1 text-[0.8rem] leading-5 text-[#8a7f73]">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[0.76rem] text-[#a89b8f]">
                      {category.productCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="px-6 pt-4">
          <div className="border-t border-[#eee6dc] pt-6">
            <p
              className={cn(
                "text-[1.12rem] leading-7 text-[#271f18]",
                locale === "ar" ? "text-right font-ui" : "font-display"
              )}
            >
              {emptyTitle}
            </p>
            <p
              className={cn(
                "mt-2 text-[0.92rem] leading-7 text-[#7f7368]",
                locale === "ar" ? "text-right" : "text-left"
              )}
            >
              {emptyBody}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderSearchSurface({
  open,
  locale,
  isMobileViewport,
  query,
  results,
  isLoading,
  onClose,
  onQueryChange,
  onSubmit
}: HeaderSearchSurfaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const panelTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };
  const overlayTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        isMobileViewport ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 top-[4.9rem] z-[58] overflow-y-auto bg-white"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={panelTransition}
            data-lenis-prevent
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <div className="px-6 pb-2 pt-5">
                <div className="flex items-center gap-4 border-b border-[#d9d0c5] pb-3" dir="ltr">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[#6a5b50] transition hover:opacity-70"
                    aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}
                  >
                    <X className="h-[1rem] w-[1rem]" strokeWidth={1.5} />
                  </button>
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder={locale === "ar" ? "ماذا تبحث عن؟" : "What are you looking for?"}
                    className={cn(
                      "h-10 flex-1 bg-transparent text-[1rem] text-[#2a221b] placeholder:text-[#9a8f84] focus:outline-none",
                      locale === "ar" ? "text-right font-ui" : "font-display"
                    )}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </form>

            <SearchSuggestionRows
              locale={locale}
              query={query}
              results={results}
              isLoading={isLoading}
              onSelect={onClose}
            />
          </motion.div>
        ) : (
          <>
            <motion.button
              type="button"
              aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}
              className="fixed inset-0 z-[58] bg-[rgba(18,15,10,0.09)] backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={onClose}
            />

            <motion.div
              className="fixed inset-x-0 top-[calc(var(--header-height)+0.75rem)] z-[59] mx-auto w-[min(44rem,calc(100vw-2rem))]"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={panelTransition}
              data-lenis-prevent
            >
              <div className="overflow-hidden rounded-[1.85rem] border border-[#ece3d8] bg-white shadow-[0_26px_65px_-32px_rgba(15,11,8,0.34)]">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                  }}
                  className="border-b border-[#eee6dc] px-6 py-5"
                >
                  <div className="flex items-center gap-4">
                    <Search className="h-4 w-4 text-[#8b7e72]" strokeWidth={1.65} />
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(event) => onQueryChange(event.target.value)}
                      placeholder={
                        locale === "ar"
                          ? "ابحثي عن منتج، فئة أو shade"
                          : "Search for a product, category, or shade"
                      }
                      className={cn(
                        "h-12 flex-1 bg-transparent text-[1.02rem] text-[#2a221b] placeholder:text-[#9a8f84] focus:outline-none",
                        locale === "ar" ? "text-right font-ui" : "font-display"
                      )}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eee6dc] text-[#6a5b50] transition hover:bg-[#fbf7f3]"
                      aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}
                    >
                      <X className="h-[0.95rem] w-[0.95rem]" strokeWidth={1.45} />
                    </button>
                  </div>
                </form>

                <div className="max-h-[70vh] overflow-y-auto">
                  <SearchSuggestionRows
                    locale={locale}
                    query={query}
                    results={results}
                    isLoading={isLoading}
                    onSelect={onClose}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )
      ) : null}
    </AnimatePresence>
  );
}
