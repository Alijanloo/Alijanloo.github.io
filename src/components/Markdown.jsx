import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { useTheme } from "../context/ThemeContext.jsx";
import { toAssetUrl } from "../lib/postUtils.js";

// Asset references in posts are stored as bare slug paths
// (e.g. "word-embedding/embedding_concept.png") and resolved through the
// Worker's /assets proxy at render time. Absolute URLs and anchors pass
// through untouched.
function transformUrl(url) {
  if (!url) return url;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("#") || url.startsWith("mailto:")) {
    return url;
  }
  return url;
}

let mermaidPromise = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({ startOnLoad: false });
      return mermaid;
    });
  }
  return mermaidPromise;
}

function renderMermaid(mermaid, code, id, theme) {
  mermaid.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default" });
  return mermaid.render(id, code).then(({ svg }) => svg);
}

function MermaidBlock({ code }) {
  const { theme } = useTheme();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    setError("");
    loadMermaid()
      .then((mermaid) => renderMermaid(mermaid, code, idRef.current, theme))
      .then((svg) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err?.message || err));
      });
    return () => {
      cancelled = true;
    };
  }, [code, theme]);

  if (error) {
    return (
      <pre className="mermaid-error">
        <code>{code}</code>
      </pre>
    );
  }
  return (
    <div
      className="mermaid-diagram"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? null : <pre className="mermaid-source">{code}</pre>}
    </div>
  );
}

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        rehypeKatex,
        [rehypeHighlight, { detect: true, ignoreMissing: true }],
      ]}
      urlTransform={transformUrl}
      components={{
        a: ({ node, ...props }) => {
          const href = props.href || "";
          const external = /^https?:\/\//.test(href);
          return (
            <a
              {...props}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            />
          );
        },
        img: ({ node, ...props }) => (
          <img
            {...props}
            src={toAssetUrl(props.src)}
            loading="lazy"
            alt={props.alt || ""}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="table-wrap">
            <table {...props} />
          </div>
        ),
        pre: ({ node, children, ...props }) => {
          const child = Array.isArray(children) ? children[0] : children;
          const className = child?.props?.className || "";
          if (className.includes("language-mermaid")) {
            return <MermaidBlock code={String(child.props.children || "")} />;
          }
          return <pre {...props}>{children}</pre>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
