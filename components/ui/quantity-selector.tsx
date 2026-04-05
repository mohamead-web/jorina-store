"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QuantitySelector({
  value,
  min = 1,
  max = 10,
  onChange
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-white/80 p-1.5 sm:p-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-10 w-10 rounded-full p-0 sm:h-9 sm:w-9"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-11 text-center text-sm font-medium text-text">
        {value}
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-10 w-10 rounded-full p-0 sm:h-9 sm:w-9"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
