"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

function SmoothScrollLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [allowSmoothScroll, setAllowSmoothScroll] = useState(false);

  const searchKey = searchParams.toString();
  const enabled = allowSmoothScroll && !reduceMotion && !pathname.includes("/account");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const reducedDataQuery = window.matchMedia("(prefers-reduced-data: reduce)");

    const update = () => {
      setAllowSmoothScroll(!coarsePointerQuery.matches && !reducedDataQuery.matches);
    };

    update();
    coarsePointerQuery.addEventListener("change", update);
    reducedDataQuery.addEventListener("change", update);

    return () => {
      coarsePointerQuery.removeEventListener("change", update);
      reducedDataQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.98,
      touchMultiplier: 1,
      anchors: {
        offset: 112
      },
      stopInertiaOnNavigate: true
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    lenisRef.current = lenis;
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();

      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    lenisRef.current?.resize();
  }, [enabled, pathname, searchKey]);

  return null;
}

export function SmoothScrollProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SmoothScrollLogic />
      </Suspense>
      {children}
    </>
  );
}
