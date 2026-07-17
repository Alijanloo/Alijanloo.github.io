import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import { toAssetUrl } from "../lib/postUtils.js";

function formatDate(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export default function PostCard({ post, editHref }) {
  const { lang, t } = useLanguage();
  return (
    <article className="card-wrapper" dir={post.dir}>
      {editHref && (
        <Link
          to={editHref}
          className="card-edit-btn"
          onClick={(e) => e.stopPropagation()}
          aria-label="Edit post"
          title="Edit post"
        >
          <i className="fas fa-pen" />
        </Link>
      )}
      <Link to={`/posts/${post.slug}`} className="post-card">
        {post.cover && (
          <div className="card-cover">
            <img src={toAssetUrl(post.cover)} alt={post.title} loading="lazy" />
          </div>
        )}
        <div className="card-body">
          {post.pin && (
            <span className="pin-badge">
              <i className="fas fa-thumbtack" /> {t("misc.pinned")}
            </span>
          )}
          <h2 className="card-title">{post.title}</h2>
          <p className="card-excerpt">{post.excerpt}</p>
          <div className="card-meta">
            <span>
              <i className="far fa-calendar" /> {formatDate(post.date, lang)}
            </span>
            {post.categories.length > 0 && (
              <span>
                <i className="far fa-folder" /> {post.categories.join(", ")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
