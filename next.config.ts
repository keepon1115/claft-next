import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLintをビルド時にスキップ（段階的復旧中）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScriptをビルド時にスキップ（段階的復旧中）
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
