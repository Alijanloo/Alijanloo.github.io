const API_BASE = "https://rapid-lake-86f8.mahmoodjanlooali.workers.dev";
const IMDB_API_BASE = "https://api.imdbapi.dev";
const IMDB_BATCH_LIMIT = 5; // hard limit enforced by titles:batchGet

// in-memory state
let rawMovies = [];      // [{id, imdbId, status, comment, ...}] from our backend
let imdbDataMap = {};    // imdbId -> title object from imdbapi.dev
let currentFilter = "all";
let currentSearch = "";
let currentSort = "added_desc";
let activeEditId = null;

const el = (id) => document.getElementById(id);

/* ---------------- helpers ---------------- */

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function statusLabel(status) {
  return { not_seen: "Not seen", watching: "Watching", watched: "Watched" }[status] || "Not seen";
}

function formatRuntime(seconds) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ---------------- auth status ---------------- */

async function checkAuth() {
  const statusEl = el("authStatus");
  try {
    const res = await fetch(`${API_BASE}/api/movies`, { credentials: "include" });
    if (res.ok) {
      statusEl.textContent = "signed in";
      statusEl.classList.add("is-in");
      return true;
    }
  } catch (_) {}
  statusEl.textContent = "not signed in";
  statusEl.classList.remove("is-in");
  return false;
}

/* ---------------- data loading ---------------- */

async function loadMovies() {
  renderSkeletons(6);
  let res;
  try {
    res = await fetch(`${API_BASE}/api/movies`, { credentials: "include" });
  } catch (err) {
    renderErrorState("Couldn't reach the server. Check your connection and try again.");
    return;
  }

  if (!res.ok) {
    renderLoggedOutState();
    return;
  }

  const data = await res.json();
  rawMovies = data.movies || [];

  if (rawMovies.length === 0) {
    imdbDataMap = {};
    renderEmptyCollectionState();
    return;
  }

  const ids = [...new Set(rawMovies.map((m) => m.imdbId).filter(Boolean))];
  await fetchImdbBatch(ids);
  renderGrid();
}

async function fetchImdbBatch(imdbIds) {
  const batches = chunk(imdbIds, IMDB_BATCH_LIMIT);
  const results = await Promise.all(
    batches.map(async (batch) => {
      const params = batch.map((id) => `titleIds=${encodeURIComponent(id)}`).join("&");
      try {
        const res = await fetch(`${IMDB_API_BASE}/titles:batchGet?${params}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.titles || [];
      } catch (_) {
        return [];
      }
    })
  );
  imdbDataMap = {};
  for (const title of results.flat()) {
    if (title && title.id) imdbDataMap[title.id] = title;
  }
}

/* ---------------- add movie ---------------- */

el("movieForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = el("movieImdbId");
  const msg = el("formMsg");
  const btn = el("addBtn");
  const imdbId = input.value.trim();

  msg.textContent = "";
  msg.classList.remove("success");

  if (!/^tt\d{7,8}$/.test(imdbId)) {
    msg.textContent = "That doesn't look like a valid IMDb ID (expected format: tt0111161).";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Adding…";

  try {
    const res = await fetch(`${API_BASE}/api/movies`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imdbId,
        status: "not_seen",
        comment: "",
      }),
    });

    if (res.ok) {
      input.value = "";
      msg.textContent = "Added to your collection.";
      msg.classList.add("success");
      await loadMovies();
    } else if (res.status === 401 || res.status === 403) {
      msg.textContent = "You need to log in with GitHub first.";
    } else {
      msg.textContent = "Couldn't save that movie. Please try again.";
    }
  } catch (_) {
    msg.textContent = "Network error — couldn't reach the server.";
  } finally {
    btn.disabled = false;
    btn.textContent = "+ Add movie";
  }
});

/* ---------------- filters, search, sort ---------------- */

el("statusFilters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if (!btn) return;
  document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderGrid();
});

let searchDebounce;
el("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderGrid();
  }, 150);
});

el("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderGrid();
});

/* ---------------- rendering ---------------- */

function getEnrichedMovies() {
  return rawMovies.map((m) => ({
    ...m,
    imdb: imdbDataMap[m.imdbId] || null,
  }));
}

function applyFiltersAndSort(movies) {
  let result = movies;

  if (currentFilter !== "all") {
    result = result.filter((m) => (m.status || "not_seen") === currentFilter);
  }

  if (currentSearch) {
    result = result.filter((m) => {
      const title = (m.imdb?.primaryTitle || m.imdb?.originalTitle || m.imdbId || "").toLowerCase();
      const genres = (m.imdb?.genres || []).join(" ").toLowerCase();
      return title.includes(currentSearch) || genres.includes(currentSearch);
    });
  }

  const sorted = [...result];
  switch (currentSort) {
    case "title_asc":
      sorted.sort((a, b) =>
        (a.imdb?.primaryTitle || "").localeCompare(b.imdb?.primaryTitle || "")
      );
      break;
    case "year_desc":
      sorted.sort((a, b) => (b.imdb?.startYear || 0) - (a.imdb?.startYear || 0));
      break;
    case "year_asc":
      sorted.sort((a, b) => (a.imdb?.startYear || 0) - (b.imdb?.startYear || 0));
      break;
    case "rating_desc":
      sorted.sort(
        (a, b) =>
          (b.imdb?.rating?.aggregateRating || 0) - (a.imdb?.rating?.aggregateRating || 0)
      );
      break;
    case "added_desc":
    default:
      sorted.reverse();
      break;
  }
  return sorted;
}

function renderGrid() {
  const list = el("movieList");
  const enriched = getEnrichedMovies();
  const visible = applyFiltersAndSort(enriched);

  el("resultsMeta").innerHTML = `Showing <strong>${visible.length}</strong> of <strong>${rawMovies.length}</strong> movie${rawMovies.length === 1 ? "" : "s"}`;

  if (visible.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <h3>No matches</h3>
        <p>Nothing in your collection matches that search or filter. Try clearing it.</p>
      </li>`;
    return;
  }

  list.innerHTML = visible.map((m) => cardTemplate(m)).join("");
}

function cardTemplate(m) {
  const t = m.imdb;
  const status = m.status || "not_seen";
  const title = escapeHtml(t?.primaryTitle || t?.originalTitle || m.imdbId);
  const year = t?.startYear ? t.startYear : null;
  const endYear = t?.endYear && t.endYear !== t.startYear ? t.endYear : null;
  const runtime = formatRuntime(t?.runtimeSeconds);
  const rating = t?.rating?.aggregateRating;
  const genres = (t?.genres || []).slice(0, 3);
  const plot = t?.plot;
  const poster = t?.primaryImage?.url;
  const comment = m.comment;

  return `
    <li class="movie-card" data-id="${escapeHtml(m.id)}">
      <div class="poster-wrap">
        ${
          poster
            ? `<img src="${escapeHtml(poster)}" alt="${title} poster" loading="lazy" />`
            : `<div class="poster-fallback">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16l5-5 4 4 5-5 4 4"/></svg>
                 <span>No poster</span>
               </div>`
        }
        <span class="status-flag" data-status="${status}">${statusLabel(status)}</span>
        ${
          rating
            ? `<span class="rating-pill">
                 <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                 ${rating.toFixed(1)}
               </span>`
            : ""
        }
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <div class="card-meta">
          ${year ? `<span>${year}${endYear ? `&ndash;${endYear}` : ""}</span>` : `<span>${escapeHtml(m.imdbId)}</span>`}
          ${runtime ? `<span class="dot">&middot;</span><span>${runtime}</span>` : ""}
        </div>
        ${genres.length ? `<div class="genre-tags">${genres.map((g) => `<span class="genre-tag">${escapeHtml(g)}</span>`).join("")}</div>` : ""}
        ${plot ? `<p class="card-plot">${escapeHtml(plot)}</p>` : ""}
        ${comment ? `<p class="card-comment">&ldquo;${escapeHtml(comment)}&rdquo;</p>` : ""}
        <div class="card-actions">
          <button type="button" class="btn-edit" data-id="${escapeHtml(m.id)}">Edit</button>
        </div>
      </div>
    </li>`;
}

function renderSkeletons(count) {
  el("resultsMeta").textContent = "";
  el("movieList").innerHTML = Array.from({ length: count })
    .map(
      () => `
      <li class="movie-card skeleton">
        <div class="poster-wrap"></div>
        <div class="card-body">
          <div class="skel-line" style="width:80%;height:14px;"></div>
          <div class="skel-line" style="width:50%;"></div>
          <div class="skel-line" style="width:95%;"></div>
        </div>
      </li>`
    )
    .join("");
}

function renderLoggedOutState() {
  el("resultsMeta").textContent = "";
  el("movieList").innerHTML = `
    <li class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
      <h3>Please log in</h3>
      <p>Sign in with GitHub to see and manage your movie collection.</p>
    </li>`;
}

function renderEmptyCollectionState() {
  el("resultsMeta").textContent = "";
  el("movieList").innerHTML = `
    <li class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>
      <h3>Nothing here yet</h3>
      <p>Add a movie above using its IMDb ID to start building your collection.</p>
    </li>`;
}

function renderErrorState(message) {
  el("resultsMeta").textContent = "";
  el("movieList").innerHTML = `
    <li class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <h3>Something went wrong</h3>
      <p>${escapeHtml(message)}</p>
    </li>`;
}

/* ---------------- edit modal ---------------- */

el("movieList").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-edit");
  if (!btn) return;
  openEditModal(btn.dataset.id);
});

function openEditModal(id) {
  const movie = rawMovies.find((m) => String(m.id) === String(id));
  if (!movie) return;
  activeEditId = movie.id;

  const t = imdbDataMap[movie.imdbId];
  el("modalTitle").textContent = t?.primaryTitle || movie.imdbId;
  el("modalSub").textContent = t?.startYear ? `${t.startYear} &middot; ${movie.imdbId}`.replace("&middot;", "·") : movie.imdbId;
  el("commentInput").value = movie.comment || "";

  document.querySelectorAll(".status-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.status === (movie.status || "not_seen"));
  });

  el("modalOverlay").classList.add("is-open");
}

function closeEditModal() {
  el("modalOverlay").classList.remove("is-open");
  activeEditId = null;
}

el("statusOptions").addEventListener("click", (e) => {
  const opt = e.target.closest(".status-option");
  if (!opt) return;
  document.querySelectorAll(".status-option").forEach((o) => o.classList.remove("active"));
  opt.classList.add("active");
});

el("modalCancel").addEventListener("click", closeEditModal);
el("modalOverlay").addEventListener("click", (e) => {
  if (e.target === el("modalOverlay")) closeEditModal();
});

el("modalSave").addEventListener("click", async () => {
  if (!activeEditId) return;
  const saveBtn = el("modalSave");
  const activeStatusEl = document.querySelector(".status-option.active");
  const status = activeStatusEl ? activeStatusEl.dataset.status : "not_seen";
  const comment = el("commentInput").value.trim();

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    const res = await fetch(`${API_BASE}/api/edit/${encodeURIComponent(activeEditId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment }),
    });

    if (res.ok) {
      const movie = rawMovies.find((m) => String(m.id) === String(activeEditId));
      if (movie) {
        movie.status = status;
        movie.comment = comment;
      }
      closeEditModal();
      renderGrid();
    } else {
      alert("Couldn't save changes. Please try again.");
    }
  } catch (_) {
    alert("Network error — couldn't reach the server.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save changes";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && el("modalOverlay").classList.contains("is-open")) {
    closeEditModal();
  }
});

/* ---------------- init ---------------- */

checkAuth();
loadMovies();
