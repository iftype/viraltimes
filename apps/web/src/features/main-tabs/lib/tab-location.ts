export type MainTab = "feed" | "dictionary";

function isDictionaryPath(pathname: string) {
  return /\/memes\/?$/.test(pathname);
}

export function resolveMainTab(
  pathname: string,
  search: string,
  fallback: MainTab = "feed",
): MainTab {
  const tab = new URLSearchParams(search).get("tab");

  if (tab === "dictionary") return "dictionary";
  if (tab === "feed") return "feed";
  if (isDictionaryPath(pathname)) return "dictionary";

  return fallback;
}
