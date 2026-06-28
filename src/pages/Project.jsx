import { useState } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../lib/projects.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import SEO from "../components/SEO.jsx";
import NotFound from "./NotFound.jsx";

export default function Project() {
  const { name } = useParams();
  const { t } = useLanguage();
  const project = getProject(name);
  const [active, setActive] = useState(0);

  if (!project) return <NotFound />;

  const page = project.pages[active];
  const src = `${project.base}/${page.file}`;

  return (
    <div className="project-page">
      <SEO title={project.title} />
      <h1 className="page-heading">{project.title}</h1>

      <div className="project-tabs">
        {project.pages.map((p, i) => (
          <button
            key={p.file}
            className={"project-tab" + (i === active ? " active" : "")}
            onClick={() => setActive(i)}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="project-frame-wrap">
        <iframe
          key={src}
          title={`${project.title} — ${page.title}`}
          src={src}
          className="project-frame"
        />
      </div>

      <p className="project-open-note">
        <a href={src} target="_blank" rel="noopener noreferrer">
          <i className="fas fa-external-link-alt" /> {t("post.read_more")}
        </a>
      </p>
    </div>
  );
}
