import type { NextConfig } from "next";

const shopHostname = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      ...(shopHostname
        ? [
            {
              protocol: "https" as const,
              hostname: shopHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
