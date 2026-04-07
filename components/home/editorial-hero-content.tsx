"use client";

import { motion, type MotionStyle } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const heroCopy = {
  ar: {
    kicker: "جمال بلا تكلّف",
    headline: "جمالٌ يعكس ثقتكِ الحقيقية",
    mobileSubheadline:
      "مساحة هادئة وصفوةً من المستحضرات التي تبرز جوهرك وتتوجكِ ملكة لكل تفصيل.",
    subheadline:
      "لأن شغفكِ لا يحتاج إلى مبالغة؛ صممنا لكِ في JORINA مساحة هادئة وصفوةً من المستحضرات التي تبرز جوهرك وتتوجكِ ملكة لكل تفصيل.",
    primaryCta: "تسوقي الآن",
    secondaryCta: "اكتشفي المجموعة"
  },
  en: {
    kicker: "Effortless beauty",
    headline: "Beauty that reflects your true confidence",
    mobileSubheadline:
      "A calm space with a curated selection of cosmetics that highlight your true essence.",
    subheadline:
      "Because true passion needs no exaggeration; JORINA offers a serene space and a curated selection of cosmetics that elevate your essence and crown every detail.",
    primaryCta: "Shop now",
    secondaryCta: "Discover the collection"
  }
} as const;


export function EditorialHeroContent({
  locale,
  style,
  mode = "overlay",
  className
}: {
  locale: "ar" | "en";
  style?: MotionStyle;
  mode?: "overlay" | "panel";
  className?: string;
}) {
  const copy = heroCopy[locale];
  const isOverlay = mode === "overlay";

  return (
    <motion.div
      style={style}
      className={cn(
        isOverlay
          ? "absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-text"
          : "relative z-10 flex h-full w-full flex-col justify-center bg-[#fafaf8] px-4 text-center text-text lg:text-left",
        className
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-col items-center",
          isOverlay
            ? "max-w-5xl px-6 sm:px-12"
            : "mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10 lg:max-w-xl lg:items-start lg:px-10 lg:py-16 xl:px-12"
        )}
      >
        <p
          className={cn(
            "font-ui uppercase tracking-[0.4em] text-text-soft",
            isOverlay ? "mb-6 text-[10px] sm:mb-10 sm:text-[11px]" : "mb-4 text-[10px] sm:mb-5 sm:text-[11px]"
          )}
        >
          {copy.kicker}
        </p>

        <h1
          className={cn(
            "font-display tracking-tight text-text",
            isOverlay
              ? "text-[3.8rem] leading-[1] min-[390px]:text-[4.5rem] sm:text-[6rem] lg:text-[8rem]"
              : "text-[3.15rem] leading-[0.94] min-[390px]:text-[3.75rem] sm:text-[4.5rem] lg:text-[5.4rem] xl:text-[6rem]"
          )}
        >
          {copy.headline}
        </h1>

        <p
          className={cn(
            "max-w-xl font-ui font-light text-text-soft",
            isOverlay ? "mt-8 text-[0.85rem] leading-7 sm:text-[1rem] sm:leading-8" : "mt-5 text-[0.92rem] leading-7 sm:text-[1rem] sm:leading-8"
          )}
        >
          <span className={isOverlay ? "sm:hidden" : "lg:hidden"}>{copy.mobileSubheadline}</span>
          <span className={isOverlay ? "hidden sm:inline" : "hidden lg:inline"}>{copy.subheadline}</span>
        </p>

        <div
          className={cn(
            "mt-10 flex items-center gap-4",
            isOverlay
              ? "w-full flex-col justify-center sm:mt-16 sm:w-auto sm:flex-row"
              : "w-full flex-col sm:w-auto sm:flex-row lg:items-start"
          )}
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "h-14 rounded-none bg-text px-10 text-[11px] font-semibold uppercase tracking-widest text-white hover:bg-black/90",
              isOverlay ? "w-full sm:w-auto" : "w-full sm:w-auto lg:min-w-[12rem]"
            )}
          >
            <Link href="/shop">{copy.primaryCta}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className={cn(
              "h-14 rounded-none border border-text/30 px-10 text-[11px] font-semibold uppercase tracking-widest text-text backdrop-blur-md hover:bg-text hover:text-white",
              isOverlay ? "w-full sm:w-auto" : "w-full sm:w-auto lg:min-w-[12rem]"
            )}
          >
            <Link href="/categories">{copy.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
