import type { NextConfig } from "next";
import path from "node:path";

const isDev = process.env.NODE_ENV === "development";
const devApiOrigin = process.env.DEV_API_ORIGIN ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // 개발 모드 시 rewrites 활성화를 위해 export 비활성화
  ...(isDev ? {} : { output: "export" }),
  transpilePackages: ["@origin/ui"],
  basePath: "/viral",
  assetPrefix: "/viral",
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  ...(isDev ? {
    async rewrites() {
      return [{ source: "/api/:path*", destination: `${devApiOrigin}/api/:path*` }];
    },
  } : {}),
};

export default nextConfig;
