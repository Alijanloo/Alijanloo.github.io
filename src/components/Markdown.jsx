import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
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
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
