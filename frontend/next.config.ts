import path from "node:path";
import type { NextConfig } from "next";

// Env files live at the repo root (shared with backend scripts); Next.js itself only reads frontend/.
// Variables already set (shell, Docker, Vercel) win, and .env.local wins over .env.
// shortcut: assumes next runs from frontend/ (pnpm --filter, Docker, Vercel root dir); no .env.development/.production support
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), "..", file));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
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
