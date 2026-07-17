import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchDynamicPostBySlug,
  createPost,
  editPost,
  deletePost,
  uploadAsset,
} from "../lib/postsApi.js";
import Markdown from "../components/Markdown.jsx";
import SEO from "../components/SEO.jsx";
import "../styles/write.css";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nowLocalInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFrontMatterDate(dateLocal) {
  const d = new Date(dateLocal);
  if (isNaN(d)) return dateLocal;
  const pad = (n) => String(n).padStart(2, "0");
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const oh = pad(Math.floor(abs / 60));
  const om = pad(abs % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )} ${sign}${oh}${om}`;
}

function computeFilename(dateLocal, finalSlug) {
  const d = new Date(dateLocal);
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = isNaN(d)
    ? "1970-01-01"
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${datePart}-${finalSlug}.md`;
}

function parseListField(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildMarkdownContent({
  title,
  dateLocal,
  categories,
  tags,
  author,
  cover,
  math,
  pin,
  body,
}) {
  const lines = ["---"];
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
  lines.push(`date: ${toFrontMatterDate(dateLocal)}`);
  if (categories.length) lines.push(`categories: [${categories.join(", ")}]`);
  if (tags.length) lines.push(`tags: [${tags.join(", ")}]`);
  if (author) lines.push(`author: ${author}`);
  if (cover) lines.push(`cover: ${cover}`);
  if (math) lines.push("math: true");
  if (pin) lines.push("pin: true");
  lines.push("---");
  lines.push("");
  lines.push(body);
  return lines.join("\n");
}

export default function Write() {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading, loggedIn, login } = useAuth();
  const isEditMode = Boolean(routeSlug);

  const [loadingPost, setLoadingPost] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [initialFilename, setInitialFilename] = useState(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(""); // base slug, without a trailing "_fa"
  const [slugTouched, setSlugTouched] = useState(false);
  const [dateLocal, setDateLocal] = useState(() => nowLocalInputValue());
  const [lang, setLang] = useState("en");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("ali_janloo");
  const [cover, setCover] = useState("");
  const [pin, setPin] = useState(false);
  const [math, setMath] = useState(false);
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: false });

  const bodyRef = useRef(null);
  const pendingSelection = useRef(null);
  const coverFileRef = useRef(null);
  const bodyFileRef = useRef(null);

  useEffect(() => {
    if (!isEditMode) return;
    let alive = true;
    setLoadingPost(true);
    fetchDynamicPostBySlug(routeSlug)
      .then((post) => {
        if (!alive) return;
        if (!post) {
          setNotFound(true);
          return;
        }
        setInitialFilename(post.filename);
        setTitle(post.title);
        setSlug(post.slug.endsWith("_fa") ? post.slug.slice(0, -3) : post.slug);
        setSlugTouched(true);
        setDateLocal(nowLocalInputValue(post.date));
        setLang(post.lang);
        setCategories(post.categories.join(", "));
        setTags(post.tags.join(", "));
        setAuthor(post.author || "ali_janloo");
        setCover(post.cover || "");
        setPin(post.pin);
        setMath(post.math);
        setBody(post.body || "");
      })
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoadingPost(false));
    return () => {
      alive = false;
    };
  }, [isEditMode, routeSlug]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (pendingSelection.current != null && bodyRef.current) {
      const pos = pendingSelection.current;
      bodyRef.current.focus();
      bodyRef.current.setSelectionRange(pos, pos);
      pendingSelection.current = null;
    }
  }, [body]);

  const baseSlug = slug || slugify(title);
  const finalSlug = lang === "fa" ? `${baseSlug}_fa` : baseSlug;
  const filename = useMemo(
    () => computeFilename(dateLocal, finalSlug || "untitled"),
    [dateLocal, finalSlug]
  );

  function insertAtCursor(text) {
    const el = bodyRef.current;
    const start = el ? el.selectionStart ?? body.length : body.length;
    const end = el ? el.selectionEnd ?? body.length : body.length;
    const next = body.slice(0, start) + text + body.slice(end);
    pendingSelection.current = start + text.length;
    setBody(next);
  }

  async function handleBodyImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!baseSlug) {
      setMessage({
        text: "Enter a title first so images can be linked to this post.",
        ok: false,
      });
      return;
    }
    setUploading(true);
    try {
      const { path } = await uploadAsset({ slug: finalSlug, file });
      insertAtCursor(`![${file.name}](${path})\n`);
    } catch (err) {
      setMessage({ text: err.message || "Image upload failed.", ok: false });
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!baseSlug) {
      setMessage({
        text: "Enter a title first so images can be linked to this post.",
        ok: false,
      });
      return;
    }
    setUploading(true);
    try {
      const { path } = await uploadAsset({ slug: finalSlug, file });
      setCover(path);
    } catch (err) {
      setMessage({ text: err.message || "Cover upload failed.", ok: false });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ text: "Title is required.", ok: false });
      return;
    }
    if (!baseSlug) {
      setMessage({ text: "Slug is required.", ok: false });
      return;
    }
    if (!body.trim()) {
      setMessage({ text: "Post body can't be empty.", ok: false });
      return;
    }

    const content = buildMarkdownContent({
      title: title.trim(),
      dateLocal,
      categories: parseListField(categories),
      tags: parseListField(tags),
      author: author.trim(),
      cover: cover.trim(),
      math,
      pin,
      body,
    });

    setSaving(true);
    setMessage({ text: "", ok: false });
    try {
      if (isEditMode) {
        await editPost({ filename, oldFilename: initialFilename, content });
        setMessage({ text: "Post updated.", ok: true });
      } else {
        await createPost({ filename, content });
        setMessage({ text: "Post published.", ok: true });
      }
      navigate(`/posts/${finalSlug}`);
    } catch (err) {
      setMessage({ text: err.message || "Couldn't save the post.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialFilename) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deletePost(initialFilename);
      navigate("/");
    } catch (err) {
      setMessage({ text: err.message || "Couldn't delete the post.", ok: false });
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading || loadingPost) {
    return <div className="route-loading">Loading…</div>;
  }

  if (!loggedIn) {
    return (
      <div className="write-page write-gate">
        <h1 className="page-heading">Sign in required</h1>
        <p>You need to log in with GitHub (via the sidebar) to write posts.</p>
        <button type="button" className="btn-add-post" onClick={login}>
          <i className="fab fa-github" /> Login with GitHub
        </button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="write-page">
        <h1 className="page-heading">Post not found</h1>
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="write-page">
      <SEO title={isEditMode ? "Edit post" : "New post"} />
      <h1 className="page-heading">{isEditMode ? "Edit post" : "New post"}</h1>

      <form className="write-form" onSubmit={handleSave}>
        <div className="write-field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
          />
        </div>

        <div className="write-row">
          <div className="write-field">
            <label>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="my-post-slug"
            />
            <div className="write-hint">File: {filename}</div>
          </div>

          <div className="write-field">
            <label>Date</label>
            <input
              type="datetime-local"
              value={dateLocal}
              onChange={(e) => setDateLocal(e.target.value)}
            />
          </div>

          <div className="write-field">
            <label>Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="fa">Persian (fa)</option>
            </select>
          </div>
        </div>

        <div className="write-row">
          <div className="write-field">
            <label>Categories (comma-separated)</label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="AI, NLP"
            />
          </div>
          <div className="write-field">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="python, langchain"
            />
          </div>
        </div>

        <div className="write-row">
          <div className="write-field">
            <label>Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="write-field write-field-cover">
            <label>Cover image URL</label>
            <div className="write-cover-row">
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => coverFileRef.current?.click()}
                disabled={uploading}
              >
                Upload
              </button>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverImage}
              />
            </div>
          </div>
        </div>

        <div className="write-row write-checkboxes">
          <label className="write-checkbox">
            <input
              type="checkbox"
              checked={pin}
              onChange={(e) => setPin(e.target.checked)}
            />
            Pinned
          </label>
          <label className="write-checkbox">
            <input
              type="checkbox"
              checked={math}
              onChange={(e) => setMath(e.target.checked)}
            />
            Contains math (KaTeX)
          </label>
        </div>

        <div className="write-field">
          <div className="write-body-toolbar">
            <label>Body (Markdown)</label>
            <div className="write-body-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => bodyFileRef.current?.click()}
                disabled={uploading}
              >
                <i className="fas fa-image" /> Insert image
              </button>
              <input
                ref={bodyFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleBodyImage}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPreview((p) => !p)}
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>

          {preview ? (
            <div
              className="write-preview"
              dir={lang === "fa" ? "rtl" : "ltr"}
            >
              <Markdown>{body || "*Nothing to preview yet.*"}</Markdown>
            </div>
          ) : (
            <textarea
              ref={bodyRef}
              className="write-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post in Markdown…"
              rows={20}
            />
          )}
        </div>

        {message.text && (
          <p className={"form-msg" + (message.ok ? " success" : "")}>
            {message.text}
          </p>
        )}

        <div className="write-actions">
          <button type="submit" className="btn-add-post" disabled={saving}>
            {saving ? "Saving…" : isEditMode ? "Save changes" : "Publish"}
          </button>
          {isEditMode && (
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete post"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
