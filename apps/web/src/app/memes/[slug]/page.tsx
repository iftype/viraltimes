import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMemeBySlug, sampleMemes } from "@/data/sample-memes";
import { MemeDetail } from "@/features/meme-detail/components/meme-detail";

type MemePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sampleMemes.map((meme) => ({ slug: meme.slug }));
}

export async function generateMetadata({
  params,
}: MemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  return meme ? { title: meme.title, description: meme.summary } : {};
}

export default async function MemePage({ params }: MemePageProps) {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  if (!meme) notFound();

  return (
    <MemeDetail
      meme={meme}
      otherMemes={sampleMemes
        .filter((candidate) => candidate.id !== meme.id)
        .slice(0, 3)}
    />
  );
}
