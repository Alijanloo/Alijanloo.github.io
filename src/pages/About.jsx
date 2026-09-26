import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";
import Timeline from "../components/Timeline.jsx";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      <SEO title={t("tabs.about")} />
      <div className="about-timeline">
        <h1 className="page-heading">About</h1>
        <Timeline />
      </div>
    </div>
  );
}
