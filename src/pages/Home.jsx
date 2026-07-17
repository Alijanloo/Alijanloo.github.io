import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SEO from "../components/SEO.jsx";

const PER_PAGE = 10;

export default function Home() {
  const { lang, toggleLang, t } = useLanguage();
  const { loggedIn } = useAuth();
  const { loading, posts } = usePosts(lang);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return posts.slice().sort((a, b) => {
      if (a.pin !== b.pin) return a.pin ? -1 : 1;
      return b.date - a.date;
    });
  }, [posts]);

  // Reset to first page whenever the language changes.
  useEffect(() => {
    setPage(1);
  }, [lang]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const visible = sorted.slice(start, start + PER_PAGE);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <SEO description="Personal blog of Ali Janloo - insights on AI, Machine Learning, NLP and daily thoughts." />
      <div className="home-heading-row">
        <h1 className="page-heading">{t("home.all_posts")}</h1>
        <div className="home-heading-actions">
          <div className="lang-switch" aria-label="Switch language">
            <button
              type="button"
              className={"lang-option" + (lang === "en" ? " active" : "")}
              onClick={() => toggleLang()}
              disabled={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              className={"lang-option" + (lang === "fa" ? " active" : "")}
              onClick={() => toggleLang()}
              disabled={lang === "fa"}
            >
              FA
            </button>
          </div>
          {loggedIn && (
            <Link to="/write" className="btn-add-post">
              <i className="fas fa-plus" /> Add post
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <div className="route-loading">Loading…</div>
      ) : visible.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="post-list">
          {visible.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              editHref={
                loggedIn ? `/write/${encodeURIComponent(post.slug)}` : null
              }
            />
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onChange={goTo} />
    </div>
  );
}
