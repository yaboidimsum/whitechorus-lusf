import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* Enable React Compiler to auto-memoize components (vercel-react-best-practices: rerender-*) */
  reactCompiler: true,

  /* Turbopack is the default bundler in Next 16 — faster builds & HMR.
     Infer side-effect-free modules for better tree shaking. */
  experimental: {
    turbopackInferModuleSideEffects: true,
  },
};

export default withAnalyzer(nextConfig);
