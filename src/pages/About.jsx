import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";
import Timeline from "../components/Timeline.jsx";
import resumeUrl from "../data/CV_Developer.pdf";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      <SEO title={t("tabs.about")} />
      <div className="about-timeline">
        <div className="about-heading-row">
          <h1 className="page-heading">About</h1>
          <a
            className="btn-download-cv"
            href={resumeUrl}
            download
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("about.download_resume")}
          </a>
        </div>
        <Timeline />
      </div>
    </div>
  );
}
