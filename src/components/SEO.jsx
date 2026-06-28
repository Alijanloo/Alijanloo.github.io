import { useEffect } from "react";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Lightweight document-head manager (replaces jekyll-seo-tag).
export default function SEO({ title, description, image }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Ali Janloo` : "Ali Janloo";
    document.title = fullTitle;
    if (description) setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    if (description) setMeta("property", "og:description", description);
    if (image) {
      const url = image.startsWith("http")
        ? image
        : `https://alijanloo.github.io${image}`;
      setMeta("property", "og:image", url);
    }
    setMeta("name", "twitter:card", "summary_large_image");
  }, [title, description, image]);

  return null;
}
