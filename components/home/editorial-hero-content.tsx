"use client";

import { motion, type MotionStyle } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

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

const detailItems = {
  ar: ["افتتاحية غامرة", "حركة سكرول ناعمة", "تجربة عربية أولًا"],
  en: ["Immersive opening", "Soft scroll reveal", "Arabic-first experience"]
} as const;

export function EditorialHeroContent({
  locale,
  style,
  mode = "overlay"
}: {
  locale: "ar" | "en";
  style?: MotionStyle;
  mode?: "overlay" | "static";
}) {
  const copy = heroCopy[locale];

  return (
    <motion.div
      style={style}
      className={
        mode === "overlay"
          ? "absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-text"
          : "relative z-10 flex h-full flex-col items-center justify-center text-center text-text px-4"
      }
    >
      <div className="relative w-full max-w-5xl px-6 sm:px-12 flex flex-col items-center">
        
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-text-soft mb-6 sm:mb-10 font-ui">
          {copy.kicker}
        </p>

        <h1 className="font-display text-[3.8rem] leading-[1] min-[390px]:text-[4.5rem] sm:text-[6rem] lg:text-[8rem] tracking-tight text-text">
          {copy.headline}
        </h1>

        <p className="mt-8 max-w-xl text-[0.85rem] sm:text-[1rem] leading-7 sm:leading-8 text-text-soft font-ui font-light">
          {copy.subheadline}
        </p>

        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          <Button asChild size="lg" className="h-14 px-10 rounded-none bg-text text-white hover:bg-black/90 uppercase tracking-widest text-[11px] font-semibold w-full sm:w-auto">
            <Link href="/shop">{copy.primaryCta}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-14 px-10 rounded-none border border-text/30 text-text hover:bg-text hover:text-white uppercase tracking-widest text-[11px] font-semibold backdrop-blur-md w-full sm:w-auto">
            <Link href="/categories">{copy.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
