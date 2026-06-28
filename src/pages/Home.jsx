import { useState, useEffect, useMemo } from "react";
import { getPostsByLang } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import PostCard from "../components/PostCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SEO from "../components/SEO.jsx";

const PER_PAGE = 10;

export default function Home() {
  const { lang, t } = useLanguage();
  const [page, setPage] = useState(1);

  const posts = useMemo(() => getPostsByLang(lang), [lang]);

  // Reset to first page whenever the language changes.
  useEffect(() => {
    setPage(1);
  }, [lang]);

  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const visible = posts.slice(start, start + PER_PAGE);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <SEO description="Personal blog of Ali Janloo - insights on AI, Machine Learning, NLP and daily thoughts." />
      <h1 className="page-heading">{t("home.all_posts")}</h1>
      {visible.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="post-list">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onChange={goTo} />
    </div>
  );
}
