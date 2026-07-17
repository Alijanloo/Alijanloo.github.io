import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { projects } from "../lib/projects.js";

const SITE_TITLE = "Ali Janloo";
const SITE_TAGLINE = "ML Engineer | NLP Enthusiast | AI Developer";

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
  { to: "/", icon: "fas fa-home", label: "HOME", end: true },
  { to: "/categories", icon: "fas fa-stream", label: "CATEGORIES" },
  { to: "/tags", icon: "fas fa-tags", label: "TAGS" },
  { to: "/archives", icon: "fas fa-archive", label: "ARCHIVES" },
  { to: "/about", icon: "fas fa-info-circle", label: "ABOUT" },
  { to: "/movies", icon: "fas fa-film", label: "MOVIES" },
];

export default function Sidebar({ open, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { loading: authLoading, loggedIn, user, login, logout } = useAuth();
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
            {SITE_TITLE}
          </NavLink>
        </h1>
        <p className="site-tagline">{SITE_TAGLINE}</p>
      </header>

      <div className="sidebar-toggles">
        {!authLoading && (
          <div className="sidebar-auth">
            {loggedIn ? (
              <button
                type="button"
                className="auth-btn"
                onClick={logout}
                title={user?.login ? `Logged in as ${user.login}` : "Logged in"}
              >
                {user?.avatar_url ? (
                  <img className="auth-avatar" src={user.avatar_url} alt="" />
                ) : (
                  <i className="fas fa-user" />
                )}
                <span>Logout</span>
              </button>
            ) : (
              <button type="button" className="auth-btn" onClick={login}>
                <i className="fab fa-github" />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
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
                <span className="tab-text">{item.label}</span>
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
                <span className="tab-text">PROJECTS</span>
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
