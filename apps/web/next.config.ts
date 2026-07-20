import type { NextConfig } from "next";
import path from "node:path";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = isGitHubActions && repositoryName ? `/${repositoryName}` : "";
const isDev = process.env.NODE_ENV === "development";
const devApiOrigin = process.env.DEV_API_ORIGIN ?? "https://meme.iftype.store";

const nextConfig: NextConfig = {
  // 로컬 개발 모드에서는 프록시(rewrites)를 정상 작동시키기 위해 export를 비활성화합니다.
  // 빌드 및 배포 환경(production)에서는 정상적으로 정적 HTML 수출(export)을 진행합니다.
  ...(isDev ? {} : { output: "export" }),

  transpilePackages: ["@origin/ui"],
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  trailingSlash: isGitHubActions,
  images: {
    unoptimized: true,
  },
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
