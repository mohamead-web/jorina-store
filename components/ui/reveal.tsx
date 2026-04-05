"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 18,
  threshold = 0.08,
  once = true,
  viewportMargin = "0px 0px 14% 0px"
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  viewportMargin?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: threshold, margin: viewportMargin }}
      transition={{
        duration: 0.58,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
