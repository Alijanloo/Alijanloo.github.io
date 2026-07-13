import { useEffect, useState, useMemo, useCallback } from "react";
import SEO from "../components/SEO.jsx";
import "../styles/movies.css";

const API_BASE = "https://rapid-lake-86f8.mahmoodjanlooali.workers.dev";

function formatUpdatedAt(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const diffMin = Math.floor((Date.now() - d) / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 365)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function splitList(value) {
  if (!value || value === "N/A") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function textOrNA(value) {
  if (!value || value === "N/A") return null;
  return value;
}

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [state, setState] = useState("loading"); // loading | ok | logged_out | error | empty
  const [filter, setFilter] = useState("watched");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated_desc");
  const [imdbInput, setImdbInput] = useState("");
  const [formMsg, setFormMsg] = useState({ text: "", ok: false });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState("not_seen");
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMovies = useCallback(async () => {
    setState("loading");
    let res;
    try {
      res = await fetch(`${API_BASE}/api/movies`, { credentials: "include" });
    } catch {
      setState("error");
      return;
    }
    if (!res.ok) {
      setState("logged_out");
      return;
    }
    const data = await res.json();
    const list = data.movies || [];
    setMovies(list);
    setState(list.length === 0 ? "empty" : "ok");
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const visible = useMemo(() => {
    let result = movies.filter((m) => m.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => {
        const t = m.imdb || {};
        const title = (t.Title || m.imdbId || "").toLowerCase();
        const genres = (t.Genre || "").toLowerCase();
        return title.includes(q) || genres.includes(q);
      });
    }
    const sorted = [...result];
    switch (sort) {
      case "title_asc":
        sorted.sort((a, b) =>
          (a.imdb?.Title || "").localeCompare(b.imdb?.Title || "")
        );
        break;
      case "year_desc":
        sorted.sort(
          (a, b) =>
            (parseInt(b.imdb?.Year, 10) || 0) -
            (parseInt(a.imdb?.Year, 10) || 0)
        );
        break;
      case "year_asc":
        sorted.sort(
          (a, b) =>
            (parseInt(a.imdb?.Year, 10) || 0) -
            (parseInt(b.imdb?.Year, 10) || 0)
        );
        break;
      case "rating_desc":
        sorted.sort(
          (a, b) =>
            (parseFloat(b.imdb?.imdbRating) || 0) -
            (parseFloat(a.imdb?.imdbRating) || 0)
        );
        break;
      default:
        sorted.sort((a, b) => {
          const ka = a.updated_at || a.created_at || "";
          const kb = b.updated_at || b.created_at || "";
          if (!ka && !kb) return 0;
          if (!ka) return 1;
          if (!kb) return -1;
          return new Date(kb) - new Date(ka);
        });
    }
    return sorted;
  }, [movies, filter, search, sort]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const imdbId = imdbInput.trim();
    setFormMsg({ text: "", ok: false });
    if (!/^tt\d{7,8}$/.test(imdbId)) {
      setFormMsg({
        text: "That doesn't look like a valid IMDb ID (expected format: tt0111161).",
        ok: false,
      });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/api/movies`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbId, status: "not_seen", comment: "" }),
      });
      if (res.ok) {
        setImdbInput("");
        setFormMsg({ text: "Added to your collection.", ok: true });
        await loadMovies();
      } else if (res.status === 401 || res.status === 403) {
        setFormMsg({ text: "You need to log in with GitHub first.", ok: false });
      } else {
        setFormMsg({
          text: "Couldn't save that movie. Please try again.",
          ok: false,
        });
      }
    } catch {
      setFormMsg({
        text: "Network error — couldn't reach the server.",
        ok: false,
      });
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (movie) => {
    setEditId(movie.id);
    setEditStatus(movie.status || "not_seen");
    setEditComment(movie.comment || "");
  };

  const closeEdit = useCallback(() => setEditId(null), []);

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/edit/${encodeURIComponent(editId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: editStatus, comment: editComment }),
        }
      );
      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) =>
            String(m.id) === String(editId)
              ? {
                  ...m,
                  status: editStatus,
                  comment: editComment,
                  updated_at: new Date().toISOString(),
                }
              : m
          )
        );
        closeEdit();
      } else {
        alert("Couldn't save changes. Please try again.");
      }
    } catch {
      alert("Network error — couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeEdit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeEdit]);

  const editing = movies.find((m) => String(m.id) === String(editId));

  return (
    <section className="movies-section">
      <SEO title="Movies" description="Ali Janloo's movie tracker." />

      <div className="marquee">
        <div className="marquee-inner">
          <h1>
            Movie <span className="accent">Tracker</span>
          </h1>
          <div className="auth-row">
            <a href={`${API_BASE}/login`}>Login with GitHub</a>
            <span className="sep">|</span>
            <a href={`${API_BASE}/api/logout`}>Logout</a>
          </div>
        </div>
      </div>

      <form className="add-form" onSubmit={handleAdd}>
        <div className="field-wrap">
          <input
            type="text"
            placeholder="IMDb ID, e.g. tt0111161"
            value={imdbInput}
            onChange={(e) => setImdbInput(e.target.value)}
          />
          <div className="field-hint">
            Find the ID in any IMDb URL — imdb.com/title/<strong>tt0111161</strong>/
          </div>
        </div>
        <button type="submit" className="btn-add" disabled={adding}>
          {adding ? "Adding…" : "+ Add movie"}
        </button>
      </form>
      <p className={"form-msg" + (formMsg.ok ? " success" : "")}>
        {formMsg.text}
      </p>

      <div className="toolbar">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search your collection…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          {[
            { key: "watched", label: "Watched" },
            { key: "not_seen", label: "Not seen" },
          ].map((f) => (
            <button
              key={f.key}
              className={"filter-chip" + (filter === f.key ? " active" : "")}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="updated_desc">Recently updated</option>
          <option value="title_asc">Title A–Z</option>
          <option value="year_desc">Newest release</option>
          <option value="year_asc">Oldest release</option>
          <option value="rating_desc">Highest rated</option>
        </select>
      </div>

      {state === "ok" && (
        <p className="results-meta">
          Showing <strong>{visible.length}</strong> of{" "}
          <strong>{movies.length}</strong> movie
          {movies.length === 1 ? "" : "s"}
        </p>
      )}

      <ul className="movie-grid">
        {state === "loading" &&
          Array.from({ length: 6 }).map((_, i) => (
            <li className="movie-card skeleton" key={i}>
              <div className="poster-wrap" />
              <div className="card-body">
                <div className="skel-line" style={{ width: "80%", height: 14 }} />
                <div className="skel-line" style={{ width: "50%" }} />
                <div className="skel-line" style={{ width: "95%" }} />
              </div>
            </li>
          ))}

        {state === "logged_out" && (
          <li className="empty-state">
            <h3>Please log in</h3>
            <p>Sign in with GitHub to see and manage your movie collection.</p>
          </li>
        )}
        {state === "error" && (
          <li className="empty-state">
            <h3>Something went wrong</h3>
            <p>Couldn't reach the server. Check your connection and try again.</p>
          </li>
        )}
        {state === "empty" && (
          <li className="empty-state">
            <h3>Nothing here yet</h3>
            <p>Add a movie above using its IMDb ID to start building your collection.</p>
          </li>
        )}
        {state === "ok" && visible.length === 0 && (
          <li className="empty-state">
            <h3>No matches</h3>
            <p>Nothing matches that search or filter. Try clearing it.</p>
          </li>
        )}

        {state === "ok" &&
          visible.map((m) => {
            const t = m.imdb || {};
            const title = t.Title || m.imdbId;
            const runtime = textOrNA(t.Runtime);
            const rating = parseFloat(t.imdbRating);
            const genres = splitList(t.Genre).slice(0, 3);
            const poster = textOrNA(t.Poster);
            const year = t.Year;
            return (
              <li className="movie-card" key={m.id}>
                <div className="poster-wrap">
                  {poster ? (
                    <img src={poster} alt={`${title} poster`} loading="lazy" />
                  ) : (
                    <div className="poster-fallback">
                      <span>No poster</span>
                    </div>
                  )}
                  <span className="status-flag" data-status={m.status}>
                    {m.status === "watched" ? "Watched" : "Not seen"}
                  </span>
                  {rating && (
                    <span className="rating-pill">★ {rating.toFixed(1)}</span>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{title}</h3>
                  <div className="card-meta">
                    {year ? <span>{year}</span> : <span>{m.imdbId}</span>}
                    {runtime && (
                      <>
                        <span className="dot">·</span>
                        <span>{runtime}</span>
                      </>
                    )}
                  </div>
                  {genres.length > 0 && (
                    <div className="genre-tags">
                      {genres.map((g) => (
                        <span className="genre-tag" key={g}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  {textOrNA(t.Plot) && (
                    <p className="card-plot">{t.Plot}</p>
                  )}
                  <div className="card-actions">
                    <button type="button" onClick={() => openEdit(m)}>
                      Details
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>

      {editing && (
        <div
          className="modal-overlay is-open"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) closeEdit();
          }}
        >
          <div className="movie-edit-modal">
            <button type="button" className="modal-close" onClick={closeEdit}>
              ×
            </button>
            <MovieModalBody movie={editing} />
            <div className="modal-edit-section">
              <label>Status</label>
              <div className="status-options">
                {["not_seen", "watched"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      "status-option" + (editStatus === s ? " active" : "")
                    }
                    data-status={s}
                    onClick={() => setEditStatus(s)}
                  >
                    {s === "watched" ? "Watched" : "Not seen"}
                  </button>
                ))}
              </div>
              <label>Comment</label>
              <textarea
                placeholder="Your thoughts on this one…"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
              {formatUpdatedAt(editing.updated_at) && (
                <p className="modal-updated">
                  Last updated{" "}
                  <strong>{formatUpdatedAt(editing.updated_at)}</strong>
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEdit}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MovieModalBody({ movie }) {
  const t = movie.imdb || {};
  const runtime = textOrNA(t.Runtime);
  const poster = textOrNA(t.Poster);
  const rating = parseFloat(t.imdbRating);
  const votes = textOrNA(t.imdbVotes);
  const year = textOrNA(t.Year);
  const genres = splitList(t.Genre);
  const type = textOrNA(t.Type);
  const directors = textOrNA(t.Director);
  const writers = textOrNA(t.Writer);
  const actors = textOrNA(t.Actors);
  const country = textOrNA(t.Country);
  const language = textOrNA(t.Language);
  const rated = textOrNA(t.Rated);
  const released = textOrNA(t.Released);
  const awards = textOrNA(t.Awards);
  const metascore = textOrNA(t.Metascore);
  const boxOffice = textOrNA(t.BoxOffice);
  const ratings = (t.Ratings || []).filter(
    (r) => r.Value && r.Value !== "N/A"
  );

  const typeLabel = type
    ? type.replace(/([A-Z])/g, " $1").trim()
    : null;

  const crew = [];
  if (directors) crew.push(["Director", directors]);
  if (writers) crew.push(["Writer", writers]);
  if (actors) crew.push(["Actors", actors]);

  const details = [];
  if (rated) details.push(["Rated", rated]);
  if (released) details.push(["Released", released]);
  if (year) details.push(["Year", year]);
  if (runtime) details.push(["Runtime", runtime]);
  if (country) details.push(["Country", country]);
  if (language) details.push(["Language", language]);
  if (metascore) details.push(["Metascore", metascore]);
  if (boxOffice) details.push(["Box Office", boxOffice]);
  if (typeLabel) details.push(["Type", typeLabel]);

  return (
    <>
      <div className="modal-header">
        <div className="modal-poster">
          {poster ? (
            <img src={poster} alt={`${t.Title || ""} poster`} />
          ) : (
            <div className="modal-poster-fallback" />
          )}
        </div>
        <div className="modal-header-info">
          {typeLabel && (
            <span className="modal-type-badge">{typeLabel}</span>
          )}
          <h2>{t.Title || movie.imdbId}</h2>
          <div className="modal-meta-line">
            {year && <span>{year}</span>}
            {runtime && (
              <>
                <span className="dot">·</span>
                <span>{runtime}</span>
              </>
            )}
            <span className="dot">·</span>
            <span>{movie.imdbId}</span>
          </div>
          {rating && (
            <div className="modal-rating-row">
              <span className="rating-num">★ {rating.toFixed(1)}</span>
              {votes && (
                <span className="vote-count">
                  ({votes.replace(/,/g, "")} votes)
                </span>
              )}
            </div>
          )}
          {genres.length > 0 && (
            <div className="modal-genres">
              {genres.map((g) => (
                <span className="genre-tag" key={g}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-body">
        {textOrNA(t.Plot) && (
          <div>
            <p className="modal-section-label">Plot</p>
            <p className="modal-plot">{t.Plot}</p>
          </div>
        )}
        {crew.length > 0 && (
          <div>
            <p className="modal-section-label">Cast &amp; Crew</p>
            <div className="modal-details-grid">
              {crew.map(([label, value]) => (
                <div className="modal-detail-item" key={label}>
                  <span className="modal-detail-label">{label}</span>
                  <span className="modal-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {ratings.length > 0 && (
          <div>
            <p className="modal-section-label">Ratings</p>
            <div className="modal-details-grid">
              {ratings.map((r) => (
                <div className="modal-detail-item" key={r.Source}>
                  <span className="modal-detail-label">{r.Source}</span>
                  <span className="modal-detail-value">{r.Value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {awards && (
          <div>
            <p className="modal-section-label">Awards</p>
            <p className="modal-plot">{awards}</p>
          </div>
        )}
        {details.length > 0 && (
          <div>
            <p className="modal-section-label">Details</p>
            <div className="modal-details-grid">
              {details.map(([label, value]) => (
                <div className="modal-detail-item" key={label}>
                  <span className="modal-detail-label">{label}</span>
                  <span className="modal-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
