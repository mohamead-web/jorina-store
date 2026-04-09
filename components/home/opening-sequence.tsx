"use client";

import Image from "next/image";
import { motion, type MotionStyle } from "framer-motion";

import { cn } from "@/lib/utils";

export function OpeningSequence({
  style,
  mode = "overlay",
  className,
  imageClassName,
  overlayClassName
}: {
  style?: MotionStyle;
  mode?: "overlay" | "panel";
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
}) {
  return (
    <motion.div
      style={style}
      className={cn(
        "pointer-events-none absolute inset-0",
        mode === "overlay" ? "z-0" : "",
        className
      )}
    >
      <Image
        src="/assets/hero/ai-luxury-bg-v7.png"
        alt="JORINA premium beauty"
        fill
        sizes="100vw"
        priority
        quality={90}
        className={cn("object-cover object-center", imageClassName)}
      />
      
      {/* Soft warm shadow for legibility without harsh black */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-[#2a1a14]/60 via-[#2a1a14]/10 to-transparent mix-blend-multiply",
          overlayClassName
        )}
      />
    </motion.div>
  );
}
