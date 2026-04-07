"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-text px-5 text-white shadow-[0_18px_40px_-28px_rgba(18,18,18,0.55)] hover:bg-[#222] active:scale-[0.98]",
        secondary:
          "border-border-strong bg-white/70 px-5 text-text hover:border-text/30 hover:bg-white",
        ghost:
          "border-transparent bg-transparent px-4 text-text-soft hover:bg-black/[0.03] hover:text-text",
        blush:
          "border-transparent bg-blush px-5 text-white hover:bg-blush-strong"
      },
      size: {
        sm: "h-10 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6",
        icon: "h-11 w-11 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
