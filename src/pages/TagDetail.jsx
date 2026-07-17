import { useParams } from "react-router-dom";
import { usePosts, getTags } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";

export default function TagDetail() {
  const { name } = useParams();
  const { lang, t } = useLanguage();
  const { loading, posts } = usePosts();
  const decoded = decodeURIComponent(name);
  const tag = getTags(posts, lang).find((c) => c.name === decoded);

  return (
    <div className="taxonomy-detail">
      <SEO title={`${decoded} — ${t("layout.tag")}`} />
      <h1 className="page-heading">
        <i className="fas fa-tag" /> {decoded}
      </h1>
      {loading ? (
        <div className="route-loading">Loading…</div>
      ) : !tag || tag.posts.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="post-list">
          {tag.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
