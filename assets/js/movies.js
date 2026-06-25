const API_BASE = "https://rapid-lake-86f8.mahmoodjanlooali.workers.dev";

// in-memory state
let rawMovies = [];      // [{id, imdbId, status, comment, imdb, ...}] from our backend
let currentFilter = "watched"; // "not_seen" | "watched"
let currentSearch = "";
let currentSort = "updated_desc";
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

function statusLabel(status) {
  return { not_seen: "Not seen", watched: "Watched" }[status] || "Not seen";
}

function formatRuntime(seconds) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatUpdatedAt(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 365) return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
    renderEmptyCollectionState();
    return;
  }

  renderGrid();
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
  return rawMovies;
}

function applyFiltersAndSort(movies) {
  let result = movies;
  result = result.filter((m) => m.status === currentFilter);

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
    case "updated_desc":
    default:
      sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
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
        <div class="card-title-row">
          <h3 class="card-title">${title}</h3>
        </div>
        <div class="card-meta">
          ${year ? `<span>${year}${endYear ? `&ndash;${endYear}` : ""}</span>` : `<span>${escapeHtml(m.imdbId)}</span>`}
          ${runtime ? `<span class="dot">&middot;</span><span>${runtime}</span>` : ""}
        </div>
        ${genres.length ? `<div class="genre-tags">${genres.map((g) => `<span class="genre-tag">${escapeHtml(g)}</span>`).join("")}</div>` : ""}
        ${plot ? `<p class="card-plot">${escapeHtml(plot)}</p>` : ""}
        <div class="card-actions">
          <button type="button" class="btn-edit" data-id="${escapeHtml(m.id)}">Details</button>
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

function personTemplate(person) {
  const name = escapeHtml(person.displayName || "Unknown");
  const img = person.primaryImage?.url;
  const profs = (person.primaryProfessions || []).join(", ");
  const initials = (person.displayName || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return `
    <div class="modal-person">
      <div class="modal-person-avatar">
        ${img ? `<img src="${escapeHtml(img)}" alt="${name}" loading="lazy" />` : `<div class="modal-person-avatar-fallback">${escapeHtml(initials)}</div>`}
      </div>
      <div>
        <div class="modal-person-name">${name}</div>
        ${profs ? `<div class="modal-person-prof">${escapeHtml(profs)}</div>` : ""}
      </div>
    </div>`;
}

function peopleGroupTemplate(label, people) {
  if (!people || people.length === 0) return "";
  return `
    <div class="modal-people-group">
      <h4>${escapeHtml(label)}</h4>
      ${people.slice(0, 4).map(personTemplate).join("")}
    </div>`;
}

function openEditModal(id) {
  const movie = rawMovies.find((m) => String(m.id) === String(id));
  if (!movie) return;
  activeEditId = movie.id;

  const t = movie.imdb || {};

  /* --- Header --- */
  el("modalTitle").textContent = t.primaryTitle || movie.imdbId;

  // Type badge
  const typeBadge = el("modalTypeBadge");
  if (t.type) {
    typeBadge.textContent = t.type.replace(/([A-Z])/g, " $1").trim();
    typeBadge.style.display = "inline-block";
  } else {
    typeBadge.style.display = "none";
  }

  // Poster
  const posterUrl = t.primaryImage?.url;
  el("modalPoster").innerHTML = posterUrl
    ? `<img src="${escapeHtml(posterUrl)}" alt="${escapeHtml(t.primaryTitle || "")} poster" />`
    : `<div class="modal-poster-fallback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16l5-5 4 4 5-5 4 4"/></svg></div>`;

  // Meta line: year · runtime · IMDb ID
  const metaParts = [];
  const yearStr = t.startYear ? String(t.startYear) + (t.endYear && t.endYear !== t.startYear ? `–${t.endYear}` : "") : "";
  if (yearStr) metaParts.push(`<span>${escapeHtml(yearStr)}</span>`);
  const runtime = formatRuntime(t.runtimeSeconds);
  if (runtime) metaParts.push(`<span class="dot">·</span><span>${escapeHtml(runtime)}</span>`);
  metaParts.push(`<span class="dot">·</span><span>${escapeHtml(movie.imdbId)}</span>`);
  el("modalMetaLine").innerHTML = metaParts.join("");

  // Rating row
  const rating = t.rating?.aggregateRating;
  const voteCount = t.rating?.voteCount;
  el("modalRatingRow").innerHTML = rating
    ? `<svg class="stars-icon" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
       <span class="rating-num">${rating.toFixed(1)}</span>
       ${voteCount ? `<span class="vote-count">(${voteCount.toLocaleString()} votes)</span>` : ""}`
    : "";

  // Genres
  const genres = t.genres || [];
  el("modalGenres").innerHTML = genres
    .map((g) => `<span class="genre-tag">${escapeHtml(g)}</span>`)
    .join("");

  /* --- Body --- */
  const bodyParts = [];

  // Plot
  if (t.plot) {
    bodyParts.push(`
      <div>
        <p class="modal-section-label">Plot</p>
        <p class="modal-plot">${escapeHtml(t.plot)}</p>
      </div>`);
  }

  // People: directors, writers, stars
  const peopleGrid = [
    peopleGroupTemplate("Directors", t.directors),
    peopleGroupTemplate("Writers", t.writers),
    peopleGroupTemplate("Stars", t.stars),
  ].filter(Boolean).join("");

  if (peopleGrid) {
    bodyParts.push(`
      <div>
        <p class="modal-section-label">Cast & Crew</p>
        <div class="modal-people-grid">${peopleGrid}</div>
      </div>`);
  }

  // Details grid: countries, languages, type
  const details = [];
  const countries = (t.originCountries || []).map((c) => c.name).join(", ");
  if (countries) details.push({ label: "Country", value: countries });
  const languages = (t.spokenLanguages || []).map((l) => l.name).join(", ");
  if (languages) details.push({ label: "Language", value: languages });
  if (t.startYear) details.push({ label: "Year", value: t.endYear && t.endYear !== t.startYear ? `${t.startYear}–${t.endYear}` : String(t.startYear) });
  if (runtime) details.push({ label: "Runtime", value: runtime });
  if (t.type) details.push({ label: "Type", value: t.type.replace(/([A-Z])/g, " $1").trim() });

  if (details.length) {
    bodyParts.push(`
      <div>
        <p class="modal-section-label">Details</p>
        <div class="modal-details-grid">
          ${details.map((d) => `<div class="modal-detail-item"><span class="modal-detail-label">${escapeHtml(d.label)}</span><span class="modal-detail-value">${escapeHtml(d.value)}</span></div>`).join("")}
        </div>
      </div>`);
  }

  // Interests
  const interests = t.interests || [];
  if (interests.length) {
    bodyParts.push(`
      <div>
        <p class="modal-section-label">Interests</p>
        <div class="modal-interests">
          ${interests.map((i) => `<span class="modal-interest-tag${i.isSubgenre ? " subgenre" : ""}">${escapeHtml(i.name)}</span>`).join("")}
        </div>
      </div>`);
  }

  el("modalBody").innerHTML = bodyParts.join("");

  /* --- Edit section --- */
  el("commentInput").value = movie.comment || "";

  document.querySelectorAll(".status-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.status === (movie.status || "not_seen"));
  });

  // Updated at
  const updatedAt = formatUpdatedAt(movie.updated_at);
  el("modalUpdated").innerHTML = updatedAt
    ? `Last updated <strong>${escapeHtml(updatedAt)}</strong>`
    : "";

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
el("modalCloseBtn").addEventListener("click", closeEditModal);
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
        movie.updated_at = new Date().toISOString();
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

loadMovies();