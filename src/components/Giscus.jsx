import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

// Embeds the giscus comment widget (ported from the Chirpy giscus config).
export default function Giscus({ term }) {
  const ref = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "Alijanloo/Alijanloo.github.io");
    script.setAttribute("data-repo-id", "R_kgDOQE-43w");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQE-4384C_1Ny");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
    script.setAttribute("data-lang", "en");
    container.appendChild(script);
  }, [term, theme]);

  return <div className="giscus-container" ref={ref} />;
}
