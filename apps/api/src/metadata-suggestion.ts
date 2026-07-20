const builtInHosts = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "dcinside.com",
  "fmkorea.com",
  "theqoo.net",
  "ruliweb.com",
  "instiz.net",
  "clien.net",
  "namu.wiki",
  "arca.live",
];

type MetadataProvider = "youtube-oembed" | "open-graph" | "url-only";

export type MetadataSuggestion = {
  sourceUrl: string;
  provider: MetadataProvider;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  siteName?: string;
  ai: { used: boolean; reason?: string };
};

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function cleanText(value?: string) {
  return value
    ? decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 1000)
    : undefined;
}

function youtubeVideoId(url: URL) {
  if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) return url.pathname.split("/").filter(Boolean)[0];
  if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
    if (url.pathname === "/watch") return url.searchParams.get("v") ?? undefined;
    const parts = url.pathname.split("/").filter(Boolean);
    if (["shorts", "embed", "live"].includes(parts[0] ?? "")) return parts[1];
  }
  return undefined;
}

function metaContent(html: string, keys: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gi)].map((match) => [match[1].toLowerCase(), match[3]]),
    );
    const key = (attributes.property ?? attributes.name ?? "").toLowerCase();
    if (keys.includes(key) && attributes.content) return cleanText(attributes.content);
  }
  return undefined;
}

async function readLimitedHtml(response: Response, limit = 512_000) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (length < limit) {
    const { value, done } = await reader.read();
    if (done || !value) break;
    const remaining = limit - length;
    chunks.push(value.byteLength > remaining ? value.slice(0, remaining) : value);
    length += Math.min(value.byteLength, remaining);
  }
  await reader.cancel().catch(() => undefined);
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export class MetadataSuggestionService {
  private readonly allowedHosts: string[];

  constructor(
    private readonly gemmaApiKey: string,
    private readonly gemmaModel = "gemma-4-26b-a4b-it",
    extraHosts = "",
  ) {
    this.allowedHosts = [...new Set([
      ...builtInHosts,
      ...extraHosts.split(",").map((host) => host.trim().toLowerCase()).filter(Boolean),
    ])];
  }

  async suggest(value: string): Promise<MetadataSuggestion> {
    const sourceUrl = this.parseAllowedUrl(value);
    const videoId = youtubeVideoId(sourceUrl);
    const metadata = videoId
      ? await this.fromYouTube(sourceUrl).catch(() => this.fromOpenGraph(sourceUrl))
      : await this.fromOpenGraph(sourceUrl);
    const base: MetadataSuggestion = {
      sourceUrl: sourceUrl.toString(),
      ...metadata,
      ai: { used: false, reason: this.gemmaApiKey ? "AI 설명 생성 실패" : "GEMMA_API_KEY 미설정" },
    };
    if (!this.gemmaApiKey || (!base.title && !base.description)) return base;
    const summary = await this.summarize(base).catch(() => undefined);
    return summary
      ? { ...base, description: summary, ai: { used: true } }
      : base;
  }

  private parseAllowedUrl(value: string) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("올바른 링크를 입력해 주세요.");
    }
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("http 또는 https 링크만 사용할 수 있습니다.");
    const hostname = url.hostname.toLowerCase();
    if (!this.allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      throw new Error("현재 자동 분석을 허용하지 않은 사이트입니다. 링크는 직접 등록할 수 있습니다.");
    }
    return url;
  }

  private async fromYouTube(url: URL): Promise<Omit<MetadataSuggestion, "sourceUrl" | "ai">> {
    const endpoint = new URL("https://www.youtube.com/oembed");
    endpoint.searchParams.set("url", url.toString());
    endpoint.searchParams.set("format", "json");
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error("YouTube 정보를 불러오지 못했습니다.");
    const data = await response.json() as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
      provider_name?: string;
    };
    return {
      provider: "youtube-oembed",
      title: cleanText(data.title),
      description: cleanText(data.author_name ? `${data.author_name} 채널의 영상입니다.` : undefined),
      thumbnailUrl: data.thumbnail_url,
      siteName: data.provider_name ?? "YouTube",
    };
  }

  private async fromOpenGraph(url: URL): Promise<Omit<MetadataSuggestion, "sourceUrl" | "ai">> {
    const response = await this.fetchAllowedPage(url);
    if (!response.ok) return { provider: "url-only", siteName: url.hostname };
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return { provider: "url-only", siteName: url.hostname };
    const html = await readLimitedHtml(response);
    const rawImage = metaContent(html, ["og:image", "twitter:image", "twitter:image:src"]);
    let thumbnailUrl: string | undefined;
    if (rawImage) {
      try {
        const candidate = new URL(rawImage, url);
        if (["http:", "https:"].includes(candidate.protocol)) thumbnailUrl = candidate.toString();
      } catch {
        thumbnailUrl = undefined;
      }
    }
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    return {
      provider: "open-graph",
      title: metaContent(html, ["og:title", "twitter:title"]) ?? cleanText(titleTag),
      description: metaContent(html, ["og:description", "description", "twitter:description"]),
      thumbnailUrl,
      siteName: metaContent(html, ["og:site_name"]) ?? url.hostname,
    };
  }

  private async fetchAllowedPage(initialUrl: URL) {
    let currentUrl = initialUrl;
    for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
      const response = await fetch(currentUrl, {
        headers: { "User-Agent": "ViralOriginMetadataBot/1.0 (+https://viralorigin.vercel.app)" },
        redirect: "manual",
        signal: AbortSignal.timeout(5_000),
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) return response;
      const location = response.headers.get("location");
      if (!location) return response;
      currentUrl = this.parseAllowedUrl(new URL(location, currentUrl).toString());
      if (redirectCount === 3) {
        throw new Error("리다이렉트가 너무 많아 정보를 불러오지 못했습니다.");
      }
    }
    throw new Error("페이지 정보를 불러오지 못했습니다.");
  }

  private async summarize(input: MetadataSuggestion) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.gemmaModel)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.gemmaApiKey },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: [
              "다음 링크 메타데이터를 바탕으로 한국어 밈 사전의 중립적인 한 줄 설명 초안을 작성해 주세요.",
              "확인되지 않은 원본·인물·날짜는 추측하지 말고, 120자 이내 문장 하나만 출력하세요.",
              `제목: ${input.title ?? "없음"}`,
              `기존 설명: ${input.description ?? "없음"}`,
              `사이트: ${input.siteName ?? "없음"}`,
              `링크: ${input.sourceUrl}`,
            ].join("\n") }],
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 180 },
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!response.ok) return undefined;
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return cleanText(data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" "))?.slice(0, 120);
  }
}
