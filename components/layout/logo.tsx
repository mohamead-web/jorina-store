import Image from "next/image";

import { Link } from "@/lib/i18n/navigation";

export function Logo({ locale }: { locale: string }) {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      dir="ltr"
      aria-label={locale === "ar" ? "العودة إلى الرئيسية" : "Back to home"}
    >
      <span className="font-display text-[1rem] font-semibold leading-none tracking-[0.18em] text-[#2b1608] sm:text-[1.12rem]">
        JORINA
      </span>
      <Image
        src="/brand/logo.png"
        alt="JORINA Luxury Cosmetics"
        width={48}
        height={48}
        className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
        sizes="(max-width: 640px) 36px, 44px"
        priority
      />
    </Link>
  );
}
