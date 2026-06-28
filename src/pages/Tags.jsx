import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getTags } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";

export default function Tags() {
  const { lang, t } = useLanguage();
  const tags = useMemo(() => getTags(lang), [lang]);

  return (
    <div className="taxonomy-page">
      <SEO title={t("tabs.tags")} />
      <h1 className="page-heading">{t("tabs.tags")}</h1>
      {tags.length === 0 ? (
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
