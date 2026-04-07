import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/utils";

export function buildMetadata({
  locale,
  title,
  description,
  pathname
}: {
  locale: string;
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const fullTitle = `${title} | JORINA`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(absoluteUrl("")),
    openGraph: {
      title: fullTitle,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      url: absoluteUrl(pathname),
      siteName: "JORINA",
      images: [
        {
          url: absoluteUrl("/brand/logo.png"),
          width: 1200,
          height: 1200,
          alt: "JORINA brand logo"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl("/brand/logo.png")]
    }
  };
}
