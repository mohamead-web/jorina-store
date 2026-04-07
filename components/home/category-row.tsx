"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  category: {
    slug: string;
    imagePath: string | null;
    name: string;
    description: string;
  };
  index: number;
  locale: "ar" | "en";
  theme: {
    watermark: string;
    bgImage: string;
  };
}

export function CategoryRow({ category, index, locale, theme }: CategoryRowProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  return (
    <Link
      ref={ref}
      data-in-view={isInView}
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 py-12 px-6 sm:px-10 transition-all duration-700 hover:border-transparent data-[in-view=true]:border-transparent"
      )}
    >
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 group-data-[in-view=true]:opacity-100 transition-opacity duration-700 bg-[#fbf9f8]">
        <Image
          src={theme.bgImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35 mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 flex items-center gap-6 sm:gap-16 w-full md:w-auto">
        <span className="text-sm font-ui opacity-40 group-hover:opacity-70 group-data-[in-view=true]:opacity-70 transition-opacity text-text group-hover:text-[#2a1a14] group-data-[in-view=true]:text-[#2a1a14]">
          {`0${index + 1}`}
        </span>
        <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] tracking-tight uppercase group-hover:pl-6 group-data-[in-view=true]:pl-6 transition-all duration-700 text-text group-hover:text-[#2a1a14] group-data-[in-view=true]:text-[#2a1a14]">
          {category.name}
        </h3>
      </div>

      <div className="relative z-10 mt-8 md:mt-0 max-w-sm flex flex-col items-start md:items-end text-left rtl:text-right">
        <p className="text-sm sm:text-base font-light font-ui leading-relaxed opacity-70 group-hover:opacity-100 group-data-[in-view=true]:opacity-100 transition-opacity text-text group-hover:text-[#2a1a14] group-data-[in-view=true]:text-[#2a1a14]">
          {category.description}
        </p>
        <span className="mt-6 inline-flex items-center text-[10px] uppercase tracking-[0.3em] font-bold border-b border-black/20 group-hover:border-[#2a1a14]/40 group-data-[in-view=true]:border-[#2a1a14]/40 text-text group-hover:text-[#2a1a14] group-data-[in-view=true]:text-[#2a1a14] pb-1 transition-colors duration-500">
          {locale === "ar" ? "استكشفي الفئة" : "View category"}
        </span>
      </div>
    </Link>
  );
}
