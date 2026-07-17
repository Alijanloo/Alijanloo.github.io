import { Link } from "react-router-dom";
import { usePosts, getTags } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";

export default function Tags() {
  const { lang, t } = useLanguage();
  const { loading, posts } = usePosts();
  const tags = getTags(posts, lang);

  return (
    <div className="taxonomy-page">
      <SEO title={t("tabs.tags")} />
      <h1 className="page-heading">{t("tabs.tags")}</h1>
      {loading ? (
        <div className="route-loading">Loading…</div>
      ) : tags.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="tag-cloud">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              to={`/tags/${encodeURIComponent(tag.name)}`}
              className="tag-chip"
            >
              {tag.name} <span className="tag-count">{tag.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
