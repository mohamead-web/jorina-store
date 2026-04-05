import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.173", "192.168.137.1", "localhost", "127.0.0.1"],
  images: {
    qualities: [60, 75, 90],
    localPatterns: [
      {
        pathname: "/assets/**",
      },
      {
        pathname: "/brand/**",
      },
    ],
  }
};

export default withNextIntl(nextConfig);
