import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { projects } from "../lib/projects.js";

const SOCIALS = [
  { type: "github", icon: "fab fa-github", url: "https://github.com/Alijanloo" },
  {
    type: "linkedin",
    icon: "fab fa-linkedin",
    url: "https://www.linkedin.com/in/ali-janloo/",
  },
  {
    type: "twitter",
    icon: "fa-brands fa-x-twitter",
    url: "https://twitter.com/Alijanloo",
  },
  {
    type: "email",
    icon: "fas fa-envelope",
    url: "mailto:mahmoodjanlooali@gmail.com",
    noblank: true,
  },
];

const NAV = [
  { to: "/", icon: "fas fa-home", key: "home", end: true },
  { to: "/categories", icon: "fas fa-stream", key: "categories" },
  { to: "/tags", icon: "fas fa-tags", key: "tags" },
  { to: "/archives", icon: "fas fa-archive", key: "archives" },
  { to: "/about", icon: "fas fa-info-circle", key: "about" },
  { to: "/movies", icon: "fas fa-film", key: "movies" },
];

export default function Sidebar({ open, onNavigate }) {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const projectsActive = location.pathname.startsWith("/projects/");
  const [projectsOpen, setProjectsOpen] = useState(projectsActive);

  return (
    <aside id="sidebar" className={open ? "is-open" : ""}>
      <header className="profile-wrapper">
        <NavLink to="/" id="avatar" onClick={onNavigate}>
          <img src="/assets/profile.jpg" width="112" height="112" alt="avatar" />
        </NavLink>
        <h1 className="site-title">
          <NavLink to="/" onClick={onNavigate}>
            {t("site.title")}
          </NavLink>
        </h1>
        <p className="site-tagline">{t("site.tagline")}</p>
      </header>

      <div className="sidebar-toggles">
        <div className="lang-toggle" onClick={toggleLang} role="button" tabIndex={0}>
          <span className={"lang-label" + (lang === "en" ? " active" : "")}>
            EN
          </span>
          <span className="switch" aria-hidden="true">
            <span className={"slider" + (lang === "fa" ? " on" : "")} />
          </span>
          <span className={"lang-label" + (lang === "fa" ? " active" : "")}>
            FA
          </span>
        </div>

        <span className="icon-border" />

        <button
          type="button"
          className="mode-toggle"
          aria-label="Switch Mode"
          onClick={toggleTheme}
        >
          <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav">
          {NAV.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className="nav-link"
                onClick={onNavigate}
              >
                <i className={"fa-fw " + item.icon} />
                <span className="tab-text">{t(`tabs.${item.key}`)}</span>
              </NavLink>
            </li>
          ))}

          {projects.length > 0 && (
            <li className={"nav-item" + (projectsActive ? " active" : "")}>
              <button
                type="button"
                className="nav-link projects-toggle-label"
                onClick={() => setProjectsOpen((o) => !o)}
              >
                <i className="fa-fw fas fa-folder-open" />
                <span className="tab-text">{t("tabs.projects")}</span>
                <i
                  className={
                    "fas fa-chevron-down chevron-icon" +
                    (projectsOpen ? " open" : "")
                  }
                />
              </button>
              {projectsOpen && (
                <ul className="projects-list">
                  {projects.map((project) => (
                    <li className="project-item" key={project.name}>
                      <NavLink
                        to={`/projects/${project.name}`}
                        className="project-name nav-link"
                        onClick={onNavigate}
                      >
                        <i className="fas fa-cube" />
                        <span className="project-title">{project.title}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        {SOCIALS.map((s) => (
          <a
            key={s.type}
            href={s.url}
            aria-label={s.type}
            target={s.noblank ? undefined : "_blank"}
            rel={s.noblank ? undefined : "noopener noreferrer"}
          >
            <i className={s.icon} />
          </a>
        ))}
      </div>
    </aside>
  );
}
