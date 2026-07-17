import { Link } from "react-router-dom";
import { usePosts, getArchives } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";

function formatDay(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export default function Archives() {
  const { lang, t } = useLanguage();
  const { loading, posts } = usePosts();
  const archives = getArchives(posts, lang);

  return (
    <div className="archives-page">
      <SEO title={t("tabs.archives")} />
      <h1 className="page-heading">{t("tabs.archives")}</h1>
      {loading ? (
        <div className="route-loading">Loading…</div>
      ) : archives.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        archives.map((group) => (
          <section className="archive-year" key={group.year}>
            <h2 className="archive-year-title">{group.year}</h2>
            <ul className="archive-list">
              {group.posts.map((post) => (
                <li key={post.slug}>
                  <span className="archive-date">
                    {formatDay(post.date, lang)}
                  </span>
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
