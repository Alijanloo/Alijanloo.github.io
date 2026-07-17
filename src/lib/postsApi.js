// Client for the Cloudflare Worker's post endpoints, backed by a separate
// GitHub content repo (see .data/worker.js). Posts are served exclusively
// from here; the listing metadata comes from a lightweight index.json.
import fm from "front-matter";
import { API_BASE } from "./apiBase.js";
import {
  parseDate,
  toArray,
  buildExcerpt,
  slugFromFilename,
  langFromSlug,
} from "./postUtils.js";

const LIST_PAGE_SIZE = 50;
const CACHE_TTL_MS = 60 * 1000;

// Per-language cache (key "all" holds the unfiltered listing).
let listCache = new Map();

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function mapIndexEntry(entry) {
  const slug = entry.slug || slugFromFilename(entry.filename);
  const lang = entry.lang || langFromSlug(slug);
  return {
    slug,
    filename: entry.filename,
    lang,
    dir: lang === "fa" ? "rtl" : "ltr",
    title: entry.title || slug,
    date: parseDate(entry.date),
    dateRaw: entry.date,
    categories: toArray(entry.categories),
    tags: toArray(entry.tags),
    author: entry.author || "ali_janloo",
    cover: entry.cover || null,
    pin: Boolean(entry.pin),
    math: Boolean(entry.math),
    excerpt: entry.excerpt || "",
    source: "dynamic",
  };
}

function mapRawPost(filename, content) {
  const { attributes, body } = fm(content);
  const slug = slugFromFilename(filename);
  const lang = langFromSlug(slug, attributes.lang || "en");
  return {
    slug,
    filename,
    lang,
    dir: lang === "fa" ? "rtl" : "ltr",
    title: attributes.title || slug,
    date: parseDate(attributes.date),
    dateRaw: attributes.date,
    categories: toArray(attributes.categories),
    tags: toArray(attributes.tags),
    author: attributes.author || "ali_janloo",
    cover: attributes.cover || attributes.image || null,
    pin: Boolean(attributes.pin),
    math: Boolean(attributes.math),
    excerpt: buildExcerpt(body),
    body,
    raw: content,
    source: "dynamic",
  };
}

// Fetches dynamic post listing metadata (paginating through /get_posts as
// needed) and caches the merged result briefly, since it's used by several
// listing pages. Pass `lang` to let the Worker filter server-side.
export async function fetchDynamicPosts({ force = false, lang } = {}) {
  const key = lang || "all";
  if (!force) {
    const cached = listCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.posts;
    }
  }

  const posts = [];
  let page = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIST_PAGE_SIZE),
    });
    if (lang) params.set("lang", lang);
    const res = await fetch(`${API_BASE}/get_posts?${params.toString()}`);
    if (!res.ok) break;
    const data = await res.json();
    posts.push(...(data.posts || []).map(mapIndexEntry));
    if (!data.totalPages || page >= data.totalPages) break;
    page += 1;
  }

  listCache.set(key, { posts, fetchedAt: Date.now() });
  return posts;
}

export function invalidateDynamicPostsCache() {
  listCache.clear();
}

// Fetches a single dynamic post's full markdown (front matter + body) by
// its public slug, and returns it normalized like a static post.
export async function fetchDynamicPostBySlug(slug) {
  const res = await fetch(
    `${API_BASE}/get_post?slug=${encodeURIComponent(slug)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError("Failed to load post", res.status);
  const data = await res.json();
  return mapRawPost(data.filename, data.content);
}

export async function fetchDynamicPostByFilename(filename) {
  const res = await fetch(
    `${API_BASE}/get_post?filename=${encodeURIComponent(filename)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError("Failed to load post", res.status);
  const data = await res.json();
  return mapRawPost(data.filename, data.content);
}

export async function createPost({ filename, content }) {
  const res = await fetch(`${API_BASE}/create_post`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content }),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  invalidateDynamicPostsCache();
  return data;
}

export async function editPost({ filename, oldFilename, content }) {
  const res = await fetch(`${API_BASE}/edit_post`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, oldFilename, content }),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  invalidateDynamicPostsCache();
  return data;
}

export async function deletePost(filename) {
  const res = await fetch(
    `${API_BASE}/edit_post?filename=${encodeURIComponent(filename)}`,
    { method: "DELETE", credentials: "include" }
  );
  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  invalidateDynamicPostsCache();
  return data;
}

// Uploads an image for a given post slug and returns `{ path, url }`, where
// `url` is a ready-to-use absolute URL (via the Worker's /assets proxy) that
// can be dropped straight into markdown as `![alt](url)`.
export async function uploadAsset({ slug, file }) {
  const res = await fetch(
    `${API_BASE}/upload_asset?slug=${encodeURIComponent(slug)}&filename=${encodeURIComponent(
      file.name
    )}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    }
  );
  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || `Upload failed (${res.status})`, res.status);
  }
  return data;
}
