// Shared helpers for turning post front matter / body text into the
// normalized shape used throughout the app. Used by the runtime dynamic
// posts client (postsApi.js) and the rendering components.

import { API_BASE } from "./apiBase.js";

export function parseDate(value) {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  const str = String(value).trim();
  // Matches "2026-4-25 12:00:00 +0330" or ISO-ish variants.
  const m = str.match(
    /(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (!m) {
    const d = new Date(str);
    return isNaN(d) ? new Date(0) : d;
  }
  const [, y, mo, d, h = "0", mi = "0", s = "0"] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s)
  );
}

export function toArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter((v) => v != null && v !== "");
  return [value].filter((v) => v != null && v !== "");
}

// Resolves an asset reference stored in the content repo (e.g. a cover
// path like "word-embedding/embedding_concept.png") into a usable URL via
// the Worker's /assets proxy. Absolute URLs and non-asset URIs pass through
// unchanged.
export function toAssetUrl(p) {
  if (!p) return null;
  const path = String(p).trim();
  if (
    /^(https?:)?\/\//.test(path) ||
    path.startsWith("data:") ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  ) {
    return path;
  }
  return `${API_BASE}/assets?path=${encodeURIComponent(
    path.replace(/^\/+/, "").replace(/^assets\//, "")
  )}`;
}

export function buildExcerpt(body, max = 200) {
  const text = String(body || "")
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_>`#~|-]/g, " ")
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

// Strips the leading YYYY-MM-DD- date prefix from a post filename to derive
// its slug (e.g. "2025-01-15-my-post.md" -> "my-post").
export function slugFromFilename(filename) {
  return filename
    .replace(/\.md$/, "")
    .replace(/^\d{4}-\d{1,2}-\d{1,2}-/, "");
}

export function langFromSlug(slug, fallback = "en") {
  return slug.endsWith("_fa") ? "fa" : fallback;
}
