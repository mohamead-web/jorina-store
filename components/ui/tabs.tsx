"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex w-full flex-wrap gap-2 rounded-[1.5rem] bg-background-soft p-2",
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex min-h-11 flex-1 items-center justify-center rounded-[1.15rem] px-4 py-3 text-sm text-text-soft transition data-[state=active]:bg-white data-[state=active]:text-text data-[state=active]:shadow-[0_8px_22px_-18px_rgba(17,12,12,0.28)]",
      className
    )}
    {...props}
  />
);

export const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn("mt-5 outline-hidden", className)}
    {...props}
  />
);
