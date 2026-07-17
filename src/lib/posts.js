import { useEffect, useState } from "react";
import {
  fetchDynamicPosts,
  invalidateDynamicPostsCache,
} from "./postsApi.js";

// All posts now live in the content repo and are served via the Worker.
// This hook fetches the lightweight listing (index.json) once and shares
// the result across every page that needs it.
export function usePosts() {
  const [state, setState] = useState({ loading: true, posts: [] });
  useEffect(() => {
    let alive = true;
    fetchDynamicPosts()
      .then((posts) => {
        if (alive) setState({ loading: false, posts });
      })
      .catch(() => {
        if (alive) setState({ loading: false, posts: [] });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function invalidatePosts() {
  invalidateDynamicPostsCache();
}

export function getPostsByLang(posts, lang) {
  return posts.filter((p) => p.lang === lang);
}

export function getPostBySlug(posts, slug) {
  return posts.find((p) => p.slug === slug) || null;
}

// Given a post slug, return the slug of its alternate-language version if
// it exists (graph-rag <-> graph-rag_fa).
export function getAlternateSlug(posts, slug) {
  if (slug.endsWith("_fa")) {
    const en = slug.replace(/_fa$/, "");
    return getPostBySlug(posts, en) ? en : null;
  }
  const fa = slug + "_fa";
  return getPostBySlug(posts, fa) ? fa : null;
}

export function getCategories(posts, lang) {
  const map = new Map();
  for (const post of getPostsByLang(posts, lang)) {
    for (const cat of post.categories) {
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, posts: items, count: items.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getTags(posts, lang) {
  const map = new Map();
  for (const post of getPostsByLang(posts, lang)) {
    for (const tag of post.tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, posts: items, count: items.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getArchives(posts, lang) {
  const byYear = new Map();
  for (const post of getPostsByLang(posts, lang)) {
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
