import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="notfound-page">
      <SEO title="404" />
      <h1 className="notfound-code">404</h1>
      <p className="notfound-text">{t("misc.page_not_found")}</p>
      <Link to="/" className="btn-primary">
        {t("misc.back_home")}
      </Link>
    </div>
  );
}
