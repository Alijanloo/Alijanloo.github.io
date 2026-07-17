import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePosts, getAlternateSlug } from "../lib/posts.js";
import { fetchDynamicPostBySlug } from "../lib/postsApi.js";
import { toAssetUrl } from "../lib/postUtils.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import Markdown from "../components/Markdown.jsx";
import Giscus from "../components/Giscus.jsx";
import SEO from "../components/SEO.jsx";
import NotFound from "./NotFound.jsx";

const SHARE = [
  {
    type: "Twitter",
    icon: "fa-brands fa-x-twitter",
    link: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    type: "Facebook",
    icon: "fab fa-facebook-square",
    link: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    type: "Telegram",
    icon: "fab fa-telegram",
    link: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
  },
];

function formatDate(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export default function Post() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { posts: allPosts } = usePosts();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef(null);
  const [toc, setToc] = useState([]);

  // Posts are served from the content repo via the Worker.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setPost(null);
    fetchDynamicPostBySlug(slug)
      .then((found) => {
        if (alive) setPost(found);
      })
      .catch(() => {
        if (alive) setPost(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  // When opening a post, sync the global language to the post's language.
  useEffect(() => {
    if (post && post.lang !== lang) {
      setLang(post.lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, post]);

  // When the user toggles language while reading, jump to the alternate
  // language version of this post if one exists.
  useEffect(() => {
    if (!post) return;
    if (post.lang !== lang) {
      const alt = getAlternateSlug(allPosts, post.slug);
      if (alt) navigate(`/posts/${alt}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, allPosts, post]);

  // Build a table of contents from the rendered headings.
  useEffect(() => {
    if (!articleRef.current) return;
    const headings = articleRef.current.querySelectorAll("h2, h3");
    const items = Array.from(headings).map((h) => ({
      id: h.id,
      text: h.textContent,
      level: h.tagName === "H2" ? 2 : 3,
    }));
    setToc(items);
  }, [slug, post]);

  if (loading) return <div className="route-loading">Loading…</div>;
  if (!post) return <NotFound />;

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://alijanloo.github.io/posts/${post.slug}`;

  return (
    <article className="post" dir={post.dir}>
      <SEO title={post.title} description={post.excerpt} image={toAssetUrl(post.cover)} />

      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>
            <i className="far fa-calendar" /> {formatDate(post.date, post.lang)}
          </span>
          {post.categories.length > 0 && (
            <span>
              <i className="far fa-folder" />{" "}
              {post.categories.map((c, i) => (
                <span key={c}>
                  {i > 0 && ", "}
                  <Link to={`/categories/${encodeURIComponent(c)}`}>{c}</Link>
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      {post.cover && (
        <div className="post-cover">
          <img src={toAssetUrl(post.cover)} alt={post.title} />
        </div>
      )}

      <div className="post-layout">
        <div className="post-content" ref={articleRef}>
          <Markdown>{post.body}</Markdown>
        </div>

        {toc.length > 1 && (
          <aside className="post-toc" dir="ltr">
            <p className="toc-title">{t("panel.toc")}</p>
            <ul>
              {toc.map((item) => (
                <li key={item.id} className={`toc-level-${item.level}`}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="tag-chip"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="post-share">
        <span className="share-label">Share:</span>
        {SHARE.map((s) => (
          <a
            key={s.type}
            href={s.link(shareUrl, post.title)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${s.type}`}
          >
            <i className={s.icon} />
          </a>
        ))}
      </div>

      <section className="post-comments">
        <Giscus term={post.slug} />
      </section>
    </article>
  );
}
