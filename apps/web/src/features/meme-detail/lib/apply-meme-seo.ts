import type { Meme } from "@/types/meme";

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.dataset.viraloriginSeo = "true";
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
};

export function applyMemeSeo(meme: Meme) {
  const originalTitle = document.title;
  const existingDescription = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  const originalDescription = existingDescription?.content;
  const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const originalCanonical = existingCanonical?.href;
  const canonicalUrl = `https://viralorigin.vercel.app/memes/${encodeURIComponent(meme.slug)}`;
  const challengeLabel = meme.kind === "challenge" ? " 챌린지" : "";
  const aliases = meme.aliases.slice(0, 6);
  const aliasKeywords = aliases.map((alias) => `${alias} 원조`).join(", ");
  const title = `${meme.title}${challengeLabel} 원조·원본${aliases[0] ? ` | ${aliases[0]} 원조` : ""} | ViralOrigin`;
  const description = `${meme.title} 원본과 ${meme.title}${challengeLabel} 원조를 근거와 타임라인으로 확인하세요.${aliasKeywords ? ` ${aliasKeywords}로도 불리는 같은 유행의 시작과 확산 과정을 정리합니다.` : ""}`;
  const keywords = [
    `${meme.title} 원본`,
    `${meme.title} 원조`,
    ...(meme.kind === "challenge" ? [`${meme.title} 챌린지 원조`, `${meme.title} 챌린지 원본`] : []),
    ...aliases.flatMap((alias) => [`${alias} 원본`, `${alias} 원조`]),
    ...meme.tags,
  ].join(", ");

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: "article" });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.dataset.viraloriginSeo = "true";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  document.head.querySelector('script[data-viralorigin-seo="jsonld"]')?.remove();
  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.dataset.viraloriginSeo = "jsonld";
  jsonLd.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${meme.title}${challengeLabel} 원본과 원조`,
    alternateName: aliases,
    description,
    url: canonicalUrl,
    dateModified: meme.origin.lastReviewedAt,
    keywords,
    isPartOf: { "@type": "WebSite", name: "ViralOrigin", url: "https://viralorigin.vercel.app" },
  });
  document.head.appendChild(jsonLd);

  return () => {
    document.title = originalTitle;
    if (existingDescription && originalDescription !== undefined) {
      existingDescription.content = originalDescription;
    }
    if (existingCanonical && originalCanonical) existingCanonical.href = originalCanonical;
    document.head.querySelectorAll('[data-viralorigin-seo="true"], script[data-viralorigin-seo="jsonld"]').forEach((element) => element.remove());
  };
}
