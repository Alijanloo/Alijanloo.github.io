import fm from "front-matter";

// Eagerly import every markdown post as a raw string.
const rawPosts = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseDate(value) {
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

function toArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter((v) => v != null && v !== "");
  return [value].filter((v) => v != null && v !== "");
}

function normalizeAssetPath(p) {
  if (!p) return null;
  let path = String(p).trim();
  if (/^https?:\/\//.test(path)) return path;
  if (!path.startsWith("/")) path = "/" + path;
  return path;
}

function buildExcerpt(body, max = 200) {
  const text = body
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

const posts = Object.entries(rawPosts)
  .map(([path, raw]) => {
    const fileName = path.split("/").pop().replace(/\.md$/, "");
    // strip the leading YYYY-MM-DD- date prefix to form the slug
    const slug = fileName.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, "");
    const { attributes, body } = fm(raw);
    const lang = slug.endsWith("_fa") ? "fa" : attributes.lang || "en";

    return {
      slug,
      lang,
      dir: lang === "fa" ? "rtl" : "ltr",
      title: attributes.title || slug,
      date: parseDate(attributes.date),
      dateRaw: attributes.date,
      categories: toArray(attributes.categories),
      tags: toArray(attributes.tags),
      author: attributes.author || "ali_janloo",
      cover: normalizeAssetPath(attributes.cover || attributes.image),
      pin: Boolean(attributes.pin),
      math: Boolean(attributes.math),
      excerpt: buildExcerpt(body),
      body,
    };
  })
  .sort((a, b) => {
    if (a.pin !== b.pin) return a.pin ? -1 : 1;
    return b.date - a.date;
  });

export function getAllPosts() {
  return posts;
}

export function getPostsByLang(lang) {
  return posts.filter((p) => p.lang === lang);
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null;
}

// Given a post slug, return the slug of its alternate-language version if it
// exists (graph-rag <-> graph-rag_fa).
export function getAlternateSlug(slug) {
  if (slug.endsWith("_fa")) {
    const en = slug.replace(/_fa$/, "");
    return getPostBySlug(en) ? en : null;
  }
  const fa = slug + "_fa";
  return getPostBySlug(fa) ? fa : null;
}

export function getCategories(lang) {
  const map = new Map();
  for (const post of getPostsByLang(lang)) {
    for (const cat of post.categories) {
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, posts: items, count: items.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getTags(lang) {
  const map = new Map();
  for (const post of getPostsByLang(lang)) {
    for (const tag of post.tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, posts: items, count: items.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getArchives(lang) {
  const byYear = new Map();
  for (const post of getPostsByLang(lang)) {
    const year = post.date.getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(post);
  }
  return Array.from(byYear.entries())
    .map(([year, items]) => ({
      year,
      posts: items.sort((a, b) => b.date - a.date),
    }))
    .sort((a, b) => b.year - a.year);
}
