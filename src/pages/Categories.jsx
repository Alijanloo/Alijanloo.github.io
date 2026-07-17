import { Link } from "react-router-dom";
import { usePosts, getCategories } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";

export default function Categories() {
  const { lang, t } = useLanguage();
  const { loading, posts } = usePosts();
  const categories = getCategories(posts, lang);

  return (
    <div className="taxonomy-page">
      <SEO title={t("tabs.categories")} />
      <h1 className="page-heading">{t("tabs.categories")}</h1>
      {loading ? (
        <div className="route-loading">Loading…</div>
      ) : categories.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="taxonomy-grid">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/categories/${encodeURIComponent(cat.name)}`}
              className="taxonomy-card"
            >
              <i className="far fa-folder" />
              <span className="taxonomy-name">{cat.name}</span>
              <span className="taxonomy-count">{cat.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
