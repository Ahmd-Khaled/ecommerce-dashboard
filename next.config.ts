
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL;

    if (!apiOrigin) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin.replace(/\/$/, "")}/:path*`,
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin(
  "./src/i18n/request.ts"
);

export default withNextIntl(nextConfig);
