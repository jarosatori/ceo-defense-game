import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phaser doesn't tolerate React strict mode's intentional double-invocation
  // of effects in dev. Disable it (production renders are unaffected — strict
  // mode only applies in dev anyway).
  reactStrictMode: false,
};

export default nextConfig;
