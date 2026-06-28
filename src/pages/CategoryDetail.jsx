import { useParams } from "react-router-dom";
import { getCategories } from "../lib/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";

export default function CategoryDetail() {
  const { name } = useParams();
  const { lang, t } = useLanguage();
  const decoded = decodeURIComponent(name);
  const category = getCategories(lang).find((c) => c.name === decoded);

  return (
    <div className="taxonomy-detail">
      <SEO title={`${decoded} — ${t("layout.category")}`} />
      <h1 className="page-heading">
        <i className="far fa-folder" /> {decoded}
      </h1>
      {!category || category.posts.length === 0 ? (
        <p className="empty-note">{t("misc.no_posts")}</p>
      ) : (
        <div className="post-list">
          {category.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
