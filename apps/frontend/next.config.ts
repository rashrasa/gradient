import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  watchOptions: process.env.POLL_INTERVAL_MS ? {
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS)
  } : undefined,

  output: "standalone"
};

export default nextConfig;
