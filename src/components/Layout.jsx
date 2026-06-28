import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div id="app-shell">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label="Toggle navigation"
        onClick={() => setNavOpen((o) => !o)}
      >
        <i className={navOpen ? "fas fa-times" : "fas fa-bars"} />
      </button>

      {navOpen && (
        <div className="nav-backdrop" onClick={() => setNavOpen(false)} />
      )}

      <main id="main-wrapper">
        <div className="content-container">{children}</div>
        <footer className="site-footer">
          <p>
            &copy; {new Date().getFullYear()} Ali Janloo. Built with React.
          </p>
        </footer>
      </main>
    </div>
  );
}
