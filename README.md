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
- 🌐 **Bilingual** (English + Persian) with browser detection, a sidebar toggle,
  per-content RTL, and automatic switching between parallel post versions
- 🗂️ **Categories, Tags, and Archives**, all language-aware
- 🎬 **Movie tracker** backed by a Cloudflare Worker API
- 📚 **Project docs** rendered from standalone HTML
- 🌗 **Light / dark theme** toggle
- 💬 **Giscus** comments and **SEO** meta tags
- 📱 Responsive layout with a mobile navigation drawer

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
│   ├── assets/               # Post images, avatar
│   ├── projects/             # Standalone project HTML docs
│   ├── 404.html              # GitHub Pages SPA fallback
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── main.jsx              # React entry, providers, global styles
│   ├── App.jsx               # Routes
│   ├── i18n.js               # UI translation strings (en/fa)
│   ├── content/posts/        # Markdown blog posts
│   ├── context/              # Language + Theme React contexts
│   ├── lib/                  # posts loader, projects metadata
│   ├── components/           # Sidebar, Layout, PostCard, Markdown, ...
│   ├── pages/                # Home, Post, Categories, Tags, Archives, ...
│   └── styles/               # Global + movies CSS
└── .github/workflows/        # GitHub Pages build & deploy
```

## ✍️ Writing Posts

Add a Markdown file to `src/content/posts/` named `YYYY-MM-DD-post-title.md`:

```markdown
---
title: "Your Post Title"
date: 2025-01-15 10:00:00 +0330
categories: [AI, NLP]
tags: [python, langchain]
author: ali_janloo
cover: assets/your-image.jpg
math: true
---

Your content here…
```

For the Persian version, add a `_fa` suffix (`...-post-title_fa.md`). Posts whose
slug ends in `_fa` are treated as Persian (RTL) and shown only in Persian mode.
The post's images go in `public/assets/`.

## 🌐 Deployment

Pushing to `main` triggers the GitHub Actions workflow, which builds the Vite app
and deploys `/dist` to GitHub Pages. Client-side routing deep links are handled
via the `404.html` SPA redirect trick.

## 📬 Contact

- 💼 [LinkedIn](https://www.linkedin.com/in/ali-janloo/)
- 🐙 [GitHub](https://github.com/Alijanloo)
- 📧 [Email](mailto:mahmoodjanlooali@gmail.com)

## 📄 License

Licensed under the [MIT License](LICENSE).

---

**Made with ❤️ by Ali Janloo**
