import Image from "next/image";

import { Link } from "@/lib/i18n/navigation";

export function Logo({ locale }: { locale: string }) {
  return (
    <Link
      href="/"
      className="flex items-center"
      aria-label={locale === "ar" ? "العودة إلى الرئيسية" : "Back to home"}
    >
      <div className="relative flex items-center">
        <Image
          src="/brand/logo-cropped.png"
          alt="JORINA Luxury Cosmetics"
          width={300}
          height={300}
          className="h-[45px] w-auto sm:h-[55px] object-contain"
          priority
        />
      </div>
    </Link>
  );
}
