import type { Resource } from "@/types";

const enc = encodeURIComponent;

/** Build a safe URL for a resource. Only https URLs the model gave us are used as-is; everything else is a search. */
export function resourceUrl(r: Resource): string {
  if (r.kind === "link" && /^https:\/\//i.test(r.query)) return r.query;
  switch (r.kind) {
    case "location":
      return `https://www.google.com/maps/search/?api=1&query=${enc(r.query)}`;
    case "video":
      return `https://www.youtube.com/results?search_query=${enc(r.query)}`;
    default:
      return `https://www.google.com/search?q=${enc(r.query)}`;
  }
}

export function resourceHost(r: Resource): string {
  if (r.kind === "location") return "Google Maps";
  if (r.kind === "video") return "YouTube";
  if (r.kind === "link" && /^https:\/\//i.test(r.query)) {
    try {
      return new URL(r.query).hostname.replace(/^www\./, "");
    } catch {
      return "Link";
    }
  }
  return "Google Search";
}
