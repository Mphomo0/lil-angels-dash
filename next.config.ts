import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output lets the app run on cPanel "Setup Node.js App" hosting
  // (copy .next/standalone + static assets) as well as on Vercel.
  output: "standalone",
  images: {
    // No image optimisation server on cPanel, so serve images as-is.
    unoptimized: true,
  },
  experimental: {
    agentFeedback: true,
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

export default nextConfig;
