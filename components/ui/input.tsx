import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text shadow-[0_14px_24px_-24px_rgba(18,18,18,0.22)] transition focus:border-blush focus:bg-white sm:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
