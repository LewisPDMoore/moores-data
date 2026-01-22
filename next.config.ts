import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // In the latest Next.js, we just use the default eslint behavior
  // or configure it via the eslint.config.mjs file you already have.
};

export default nextConfig;