import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

// Diagrams render at their natural size (useMaxWidth: false) so labels stay
// readable on small screens; the figure scrolls horizontally and can be
// opened in a fullscreen zoom viewer instead of being scaled down.
const MERMAID_CONFIG = {
  startOnLoad: false,
  flowchart: { useMaxWidth: false },
  gantt: { useMaxWidth: false },
  mindmap: { useMaxWidth: false },
  sequence: { useMaxWidth: false },
  state: { useMaxWidth: false },
  er: { useMaxWidth: false },
  pie: { useMaxWidth: false },
  journey: { useMaxWidth: false },
};

let mermaidPromise = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize(MERMAID_CONFIG);
      return mermaid;
    });
  }
  return mermaidPromise;
}

function renderMermaid(mermaid, code, id, theme) {
  mermaid.initialize({
    ...MERMAID_CONFIG,
    theme: theme === "dark" ? "dark" : "default",
  });
  return mermaid.render(id, code).then(({ svg }) => svg);
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 8;

function MermaidZoom({ svg, onClose }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const movedRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // React registers onWheel as a passive listener, so preventDefault
  // requires a manual non-passive listener here.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setScale((s) =>
        Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * (e.deltaY < 0 ? 1.2 : 1 / 1.2)))
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const pinchDist = () => {
    const [a, b] = [...pointersRef.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;
    if (pointersRef.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      dragRef.current = null;
      pinchRef.current = { dist: pinchDist(), scale };
    }
  };

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const ratio = pinchDist() / pinchRef.current.dist;
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchRef.current.scale * ratio)));
      movedRef.current = true;
    } else if (dragRef.current) {
      const d = dragRef.current;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) movedRef.current = true;
      setPos({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
    }
  };

  const onPointerUp = (e) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) dragRef.current = null;
  };

  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  return createPortal(
    <div className="mermaid-overlay" role="dialog" aria-modal="true" aria-label="Diagram viewer">
      <div className="mermaid-toolbar">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s / 1.2))}
        >
          −
        </button>
        <span className="mermaid-zoom-label">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.2))}
        >
          +
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
        <button type="button" className="mermaid-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div
        ref={stageRef}
        className="mermaid-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (!movedRef.current) onClose();
        }}
      >
        <div
          className="mermaid-zoom-svg"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          onClick={(e) => e.stopPropagation()}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>,
    document.body
  );
}

function MermaidDiagram({ code }) {
  const { theme } = useTheme();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);
  const downRef = useRef(null);

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
      <div className="mermaid-figure">
        <pre className="mermaid-error">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="mermaid-figure">
      {svg ? (
        <>
          <div
            className="mermaid-diagram"
            onPointerDown={(e) => (downRef.current = { x: e.clientX, y: e.clientY })}
            onClick={(e) => {
              const d = downRef.current;
              if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) setZoomed(true);
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <button
            type="button"
            className="mermaid-expand"
            aria-label="Open diagram in fullscreen"
            title="Open diagram"
            onClick={() => setZoomed(true)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </>
      ) : (
        <pre className="mermaid-source">{code}</pre>
      )}
      {zoomed && svg && <MermaidZoom svg={svg} onClose={() => setZoomed(false)} />}
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
            return <MermaidDiagram code={String(child.props.children || "")} />;
          }
          return <pre {...props}>{children}</pre>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
