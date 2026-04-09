"use client";

import { useEffect, useState } from "react";
import { useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { EditorialHeroContent } from "@/components/home/editorial-hero-content";
import { OpeningSequence } from "@/components/home/opening-sequence";

const desktopHeroQuery = "(min-width: 1024px)";

function useDesktopHeroViewport(initialViewport: "mobile" | "desktop") {
  const [isDesktopViewport, setIsDesktopViewport] = useState(initialViewport === "desktop");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(desktopHeroQuery);
    const updateViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => {
        mediaQuery.removeEventListener("change", updateViewport);
      };
    }

    mediaQuery.addListener(updateViewport);

    return () => {
      mediaQuery.removeListener(updateViewport);
    };
  }, []);

  return isDesktopViewport;
}

function MobileHeroIntro({ locale }: { locale: "ar" | "en" }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#fafaf8] lg:hidden">
      <div className="flex min-h-[100svh] flex-col">
        <div className="relative h-[46svh] min-h-[18rem] overflow-hidden rounded-b-[2rem] bg-[#e7dbcf]">
          <OpeningSequence
            mode="panel"
            imageClassName="object-cover object-[center_32%]"
            overlayClassName="bg-gradient-to-b from-[#3e2b22]/18 via-transparent to-[#fafaf8]/85"
          />
        </div>
        <div className="flex flex-1 items-center">
          <EditorialHeroContent locale={locale} mode="panel" className="pb-8 pt-3" />
        </div>
      </div>
    </section>
  );
}

function StaticHeroFallback({
  locale,
  isDesktopViewport
}: {
  locale: "ar" | "en";
  isDesktopViewport: boolean;
}) {
  if (!isDesktopViewport) {
    return <MobileHeroIntro locale={locale} />;
  }

  return (
    <section className="relative hidden w-full overflow-hidden bg-[#fafaf8] lg:block">
      <div className="grid min-h-[100svh] grid-cols-[1.04fr_0.96fr]">
        <div className="relative min-h-[100svh] overflow-hidden bg-[#e7dbcf]">
          <OpeningSequence
            mode="panel"
            imageClassName="object-cover object-center"
            overlayClassName="bg-gradient-to-r from-[#2a1a14]/10 via-transparent to-[#fafaf8]/24"
          />
        </div>
        <div className="flex items-center bg-[#fafaf8]">
          <EditorialHeroContent locale={locale} mode="panel" className="py-12" />
        </div>
      </div>
    </section>
  );
}

function DesktopHeroSequence({ locale }: { locale: "ar" | "en" }) {
  const { scrollY } = useScroll();

  const openingOpacity = useTransform(scrollY, [0, 44, 220], [1, 1, 0]);
  const openingScale = useTransform(scrollY, [0, 220], [1, 0.972]);
  const openingBlur = useTransform(scrollY, [0, 220], [0, 4]);
  const openingFilter = useMotionTemplate`blur(${openingBlur}px)`;

  const contentOpacity = useTransform(scrollY, [42, 108, 230], [0, 0.34, 1]);
  const contentY = useTransform(scrollY, [42, 230], [18, 0]);
  const contentScale = useTransform(scrollY, [42, 230], [0.996, 1]);

  return (
    <section className="relative hidden w-full bg-[#fafaf8] lg:block">
      <div className="relative h-[200svh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#fafaf8]">
          <OpeningSequence
            mode="overlay"
            style={{
              opacity: openingOpacity,
              scale: openingScale,
              filter: openingFilter
            }}
          />
          <EditorialHeroContent
            locale={locale}
            mode="overlay"
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

export function HeroSection({
  locale,
  initialViewport = "desktop"
}: {
  locale: "ar" | "en";
  initialViewport?: "mobile" | "desktop";
}) {
  const reduceMotion = useReducedMotion();
  const isDesktopViewport = useDesktopHeroViewport(initialViewport);

  if (reduceMotion) {
    return <StaticHeroFallback locale={locale} isDesktopViewport={isDesktopViewport} />;
  }

  return isDesktopViewport ? <DesktopHeroSequence locale={locale} /> : <MobileHeroIntro locale={locale} />;
}
