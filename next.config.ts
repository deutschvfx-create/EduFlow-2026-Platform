import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Disable PWA in development to avoid caching issues during coding
  disable: process.env.NODE_ENV === "development",
  // Auto-Update Configurations
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  }
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
