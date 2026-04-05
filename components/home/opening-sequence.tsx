"use client";

import Image from "next/image";
import { motion, type MotionStyle } from "framer-motion";

export function OpeningSequence({
  locale,
  style,
  mode = "overlay"
}: {
  locale: "ar" | "en";
  style?: MotionStyle;
  mode?: "overlay" | "static";
}) {
  return (
    <motion.div
      style={style}
      className={
        mode === "overlay"
          ? "pointer-events-none absolute inset-0 z-0"
          : "pointer-events-none absolute inset-0"
      }
    >
      <Image
        src="/assets/hero/ai-luxury-bg-v7.png"
        alt="JORINA premium beauty"
        fill
        sizes="100vw"
        priority
        quality={100}
        className="object-cover object-center"
      />
      
      {/* Soft warm shadow for legibility without harsh black */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a14]/60 via-[#2a1a14]/10 to-transparent mix-blend-multiply" />
      
      {/* Top logo mark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/90 text-[10px] uppercase tracking-[0.4em] font-medium z-10">
        Jorina
      </div>
    </motion.div>
  );
}
