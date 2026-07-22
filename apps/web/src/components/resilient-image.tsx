"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

type ResilientImageProps = Omit<ImageProps, "onError" | "src"> & {
  fallback: ReactNode;
  src: string;
};

/** 외부 이미지가 거부·삭제·만료되면 전달받은 대체 화면으로 즉시 전환한다. */
export function ResilientImage({ alt, fallback, src, ...props }: ResilientImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) return <>{fallback}</>;

  return <Image {...props} alt={alt} onError={() => setFailedSrc(src)} src={src} />;
}
