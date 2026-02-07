import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {},  // Turbopack 경고 제거
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  scope: "/superpet",
  sw: "superpet-sw.js",
});

export default pwaConfig(nextConfig);
