"use client";

import { useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { EditorialHeroContent } from "@/components/home/editorial-hero-content";
import { OpeningSequence } from "@/components/home/opening-sequence";

function AmbientBackdrop() {
  return null;
}

function StaticHeroFallback({ locale }: { locale: "ar" | "en" }) {
  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-[#fafaf8]">
      <OpeningSequence locale={locale} mode="overlay" />
      <EditorialHeroContent locale={locale} mode="overlay" />
    </section>
  );
}

export function HeroSection({ locale }: { locale: "ar" | "en" }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const openingOpacity = useTransform(scrollY, [0, 44, 220], [1, 1, 0]);
  const openingScale = useTransform(scrollY, [0, 220], [1, 0.972]);
  const openingY = useTransform(scrollY, [0, 220], [0, -26]);
  const openingBlur = useTransform(scrollY, [0, 220], [0, 4]);
  const openingFilter = useMotionTemplate`blur(${openingBlur}px)`;

  const contentOpacity = useTransform(scrollY, [42, 108, 230], [0, 0.34, 1]);
  const contentY = useTransform(scrollY, [42, 230], [18, 0]);
  const contentScale = useTransform(scrollY, [42, 230], [0.996, 1]);

  if (reduceMotion) {
    return <StaticHeroFallback locale={locale} />;
  }

  return (
    <section className="relative w-full bg-[#fafaf8]">
      <div className="relative h-[200svh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#fafaf8]">
          <OpeningSequence
            locale={locale}
            style={{
              opacity: openingOpacity,
              scale: openingScale,
              filter: openingFilter
            }}
          />
          <EditorialHeroContent
            locale={locale}
            style={{
              opacity: contentOpacity,
              y: contentY,
              scale: contentScale
            }}
          />
        </div>
      </div>
    </section>
  );
}
