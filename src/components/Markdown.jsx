import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

// Ensure asset references resolve from the site root. Markdown in the posts
// uses both "/assets/x.jpg" and relative "assets/x.jpg" forms.
function transformUrl(url) {
  if (!url) return url;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("#") || url.startsWith("mailto:")) {
    return url;
  }
  if (url.startsWith("assets/")) return "/" + url;
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
          <img {...props} loading="lazy" alt={props.alt || ""} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
