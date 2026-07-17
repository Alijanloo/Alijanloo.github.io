# Ali Janloo's Personal Blog

[![Website](https://img.shields.io/badge/Website-alijanloo.github.io-blue)](https://alijanloo.github.io)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Personal blog of Ali Janloo, where I share insights about AI, machine learning,
NLP, software development, and book/film notes. Originally built with Jekyll
(Chirpy theme), now rebuilt as a **React + Vite** single-page application.

## ✨ Features

- 📝 **Markdown posts** with front matter, math (KaTeX), and syntax highlighting
- 🌐 **Bilingual** (English + Persian) posts with browser detection, a
  home-page language toggle, per-content RTL, and automatic switching between
  parallel post versions. The Worker's `/get_posts` API filters posts by
  language server-side.
- 🗂️ **Categories, Tags, and Archives**, all language-aware
- ✍️ **In-browser post editor** — create, edit, and delete posts directly from
  the site (no rebuild/deploy needed); images upload automatically to the
  content repo
- 🎬 **Movie tracker** backed by a Cloudflare Worker API
- 📚 **Project docs** rendered from standalone HTML
- 🌗 **Light / dark theme** toggle
- 💬 **Giscus** comments and **SEO** meta tags
- 📱 Responsive layout with a mobile navigation drawer

## 🏗️ Architecture

The site is split across three layers:

| Layer | What it holds | Tech |
|---|---|---|
| **Frontend** (this repo) | React SPA, served via GitHub Pages | React 18, Vite 5 |
| **Worker** (`.data/worker.js`) | API for posts CRUD, image uploads, movie tracker, and GitHub OAuth | Cloudflare Workers |
| **Content repo** (`website_db`) | Blog posts (`posts/*.md`), images (`assets/<slug>/`), and a listing cache (`index.json`) | GitHub repo |

Posts are **not** bundled at build time anymore. Instead, the frontend fetches
them at runtime through the Worker, which reads/writes the content repo via the
GitHub Contents API. This means publishing a new post takes effect instantly —
no rebuild, no redeploy.

### Why a separate content repo?

- **Instant publishing** — the `/write` page writes markdown directly to the
  repo through the Worker; the next page load picks it up.
- **Lightweight listings** — an `index.json` file at the repo root caches
  per-post metadata (title, date, categories, tags, …) so listing pages don't
  need to fetch and parse every markdown file.
- **Image storage** — uploaded images land in `assets/<post-slug>/` and are
  served back through the Worker's `/assets` proxy.

### Asset path convention

Covers and in-body images are stored as **bare slug-relative paths** (e.g.
`word-embedding/embedding_concept.png`), never full URLs. At render time the
frontend resolves them to `${WORKER}/assets?path=…`. This keeps the markdown
portable — the same file works regardless of where the Worker is hosted.

## 🚀 Development

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
.
├── index.html                # App entry (with SPA deep-link restore)
├── vite.config.js
├── public/                   # Static assets served as-is
│   ├── assets/               # Avatar, robots.txt
│   ├── projects/             # Standalone project HTML docs
│   ├── 404.html              # GitHub Pages SPA fallback
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── main.jsx              # React entry, providers, global styles
│   ├── App.jsx               # Routes
│   ├── i18n.js               # UI translation strings (en/fa)
│   ├── context/              # Language, Theme, Auth React contexts
│   ├── lib/
│   │   ├── apiBase.js        # Shared Worker origin
│   │   ├── postsApi.js       # Worker client: fetch/create/edit/delete posts
│   │   ├── posts.js          # usePosts() hook + listing selectors
│   │   ├── postUtils.js      # Shared parsers, asset-URL resolver
│   │   └── projects.js       # Project metadata
│   ├── components/           # Sidebar, Layout, PostCard, Markdown, ...
│   ├── pages/                # Home, Post, Write, Categories, Tags, ...
│   └── styles/               # Global + page-specific CSS
├── .data/
│   └── worker.js             # Cloudflare Worker: posts API, OAuth, movie tracker
└── .github/workflows/        # GitHub Pages build & deploy
```

## ✍️ Writing Posts

Posts are managed entirely through the in-browser editor at `/write`. Log in
via the sidebar's GitHub button (requires `repo` scope), then:

- **Create** — go to `/write`, fill in the title/slug/date/categories/tags/body,
  and publish. Markdown body supports image uploads (inserted at the cursor).
- **Edit** — click the pencil icon on any post card, or go to
  `/write/<slug>`.
- **Delete** — from the edit page, use the Delete button.

The editor builds a complete markdown file (front matter + body) in the same
format as the original static posts, so nothing about how posts are rendered
changed — only where they're stored.

### Front matter format

```markdown
---
title: "Your Post Title"
date: 2025-01-15 10:00:00 +0330
categories: [AI, NLP]
tags: [python, langchain]
author: ali_janloo
cover: your-slug/cover-image.jpg
math: true
---

Your content here…
```

For the Persian version, add a `_fa` suffix to the slug. Posts whose slug ends
in `_fa` are treated as Persian (RTL) and shown only in Persian mode.

### Asset paths

Covers and image references are stored as bare slug-relative paths
(e.g. `your-slug/image.png`). They're resolved through the Worker's
`/assets?path=` proxy at render time — no need to write full URLs.

## 🔧 Worker Configuration

The Cloudflare Worker (`.data/worker.js`) requires these environment
variables / secrets:

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App credentials (scope: `gist repo`) |
| `COOKIE_SECRET` | HMAC secret for signing session cookies |
| `FRONTEND_URL` / `ALLOWED_ORIGIN` | Site origin for redirects / CORS |
| `GITHUB_READ_TOKEN` | Token for public reads (higher rate limit) |
| `CONTENT_OWNER` / `CONTENT_REPO` | Owner and repo name of the content repo |
| `CONTENT_BRANCH` | Branch to read/write (default: `main`) |
| `GIST_ID` / `GIST_FILE` | Movie tracker storage (gist) |
| `OMDB_API_KEY` | Movie tracker OMDb lookups |

### API routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/get_posts` | GET | public | Paginated listing metadata from `index.json` |
| `/get_post` | GET | public | Full markdown for one post (`?slug=` or `?filename=`) |
| `/assets` | GET | public | Proxies an image from the content repo (`?path=`) |
| `/create_post` | POST | session | Creates a new post and updates `index.json` |
| `/edit_post` | PATCH | session | Updates content, renames if slug changed |
| `/edit_post` | DELETE | session | Removes a post and its `index.json` entry |
| `/upload_asset` | POST | session | Uploads an image to `assets/<slug>/` |
| `/api/me` | GET | session | Returns current login state + GitHub user info |
| `/login` / `/auth/callback` | GET | — | GitHub OAuth flow |
| `/api/logout` | GET | — | Clears session cookie |
| `/api/movies` | GET | public | Movie tracker data |
| `/api/search` | GET | public | OMDb movie search |
| `/api/edit/:id` | POST | session | Edit a movie entry |

## 🌐 Deployment

Pushing to `main` triggers the GitHub Actions workflow, which builds the Vite
app and deploys `/dist` to GitHub Pages. Client-side routing deep links are
handled via the `404.html` SPA redirect trick.

The Cloudflare Worker is deployed separately (e.g. via `wrangler deploy` from
`.data/`).

## 📬 Contact

- 💼 [LinkedIn](https://www.linkedin.com/in/ali-janloo/)
- 🐙 [GitHub](https://github.com/Alijanloo)
- 📧 [Email](mailto:mahmoodjanlooali@gmail.com)

## 📄 License

Licensed under the [MIT License](LICENSE).

---

**Made with ❤️ by Ali Janloo**
