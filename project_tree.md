# 📁 Project Structure - Ali Janloo's Blog

This is a Jekyll-based blog using the **Chirpy** theme. This guide will help you understand the project structure and where to make edits.

---

## 🌳 Project Tree Overview

```
Alijanloo.github.io/
├── _config.yml              # Main site configuration (IMPORTANT!)
├── _data/
│   ├── contact.yml          # Social media links in sidebar
│   ├── share.yml            # Social sharing options
│   └── locales/             # Language translations
│       ├── en.yml           # English UI translations
│       └── fa.yml           # Persian UI translations
├── _posts/                  # Your blog posts go here
├── _tabs/                   # Static pages accessible from sidebar
│   ├── about.md             # About page (customize with your bio)
│   ├── archives.md          # Archive page (auto-generated)
│   ├── categories.md        # Categories page (auto-generated)
│   └── tags.md              # Tags page (auto-generated)
├── _layouts/                # Custom layout overrides
│   ├── home.html            # Homepage with language filtering
│   ├── archives.html        # Archives with language filtering
│   ├── categories.html      # Categories with language filtering
│   └── tags.html            # Tags with language filtering
├── _includes/               # Custom include files
│   ├── sidebar.html         # Sidebar with language toggle
│   ├── page-lang.html       # Page language detection
│   └── metadata-hook.html   # Custom scripts and styles
├── _plugins/                # Jekyll plugins
│   ├── posts-lastmod-hook.rb       # Post modification tracking
│   ├── language-handler.rb         # Bilingual post handler
│   └── language-filter.rb          # Language content filtering
├── assets/
│   ├── img/
│   │   └── favicons/        # Website favicon images
│   ├── css/
│   │   └── lang-toggle.css  # Language toggle & RTL styles
│   ├── js/
│   │   └── lang-toggle.js   # Language switching logic
│   └── lib/                 # External libraries
├── tools/
│   ├── run.sh               # Local development server script
│   └── test.sh              # Build for production script
├── index.html               # Homepage layout
├── Gemfile                  # Ruby dependencies
├── README.md                # Project documentation
├── MULTILINGUAL_GUIDE.md    # Guide for creating bilingual posts
└── LANGUAGE_TOGGLE_SUMMARY.md  # Language feature summary
```

---

## 🌐 Bilingual Features

### Language Toggle
- **Location**: Above navigation tabs in sidebar
- **Switch Style**: EN/FA toggle switch with theme-aware colors
- **Functionality**: Switches between English and Persian content
- **Auto-detection**: Detects browser language on first visit
- **Persistence**: Saves preference in localStorage

### Persian Post Support
- **Naming**: Add `_fa.md` suffix to filename for Persian posts
- **Example**: 
  - English: `2025-11-03-my-post.md`
  - Persian: `2025-11-03-my-post_fa.md`
- **Content**: Persian post content is rendered RTL (right-to-left)
- **Layout**: Site structure remains LTR, only content is RTL

### Language Filtering
- Posts, categories, and tags are filtered based on selected language
- English mode shows only English posts and their categories/tags
- Persian mode shows only Persian posts and their categories/tags
- Switching between post versions (if both exist) is automatic

---

## 📝 Files to Edit for Personalization

### 🔧 **Essential Configuration Files**

#### 1. `_config.yml` (Main Configuration)
**Priority: HIGH** - This is the most important file!

**What to customize:**
- `title`: Your site title (e.g., "Ali Janloo")
- `tagline`: Site subtitle/description (removed from sidebar but still used in SEO)
- `description`: SEO meta description
- `url`: Your website URL (e.g., "https://alijanloo.github.io")
- `github.username`: Your GitHub username
- `twitter.username`: Your Twitter/X username
- `social.name`: Your full name
- `social.email`: Your email address
- `social.links`: Links to your social profiles
- `avatar`: Path to your profile picture (e.g., `/assets/img/avatar.jpg`)
- `timezone`: Your timezone (e.g., "Asia/Tehran")
- `lang`: Default language (`en` or `fa`)

#### 2. `_data/contact.yml` (Sidebar Social Links)
**Priority: HIGH**

**What to customize:**
- Add/update social media links shown in the sidebar
- Uncomment LinkedIn section and add your LinkedIn URL
- Update GitHub, Twitter, Email links
- Can add Stack Overflow, Reddit, etc.

#### 3. `_data/locales/` (UI Translations)
**Priority: MEDIUM**

**Files:**
- `en.yml` - English UI text (tabs, buttons, labels)
- `fa.yml` - Persian UI text (tabs, buttons, labels)

**What to customize:**
- Tab names (Home, Categories, Tags, etc.)
- Button labels
- Post metadata labels
- Search text
- Date formats

#### 4. `_tabs/about.md` (About Page)
**Priority: HIGH**

**What to customize:**
- Replace placeholder content with your bio
- Add your education, experience, skills
- Include your tech stack, projects, achievements
- Add GitHub stats, badges, etc.

---

## 📂 Content Management

### ✍️ **Writing Blog Posts**

Create new posts in `_posts/` with this naming format:
```
YYYY-MM-DD-post-title.md
```

**Example:** `2025-01-15-getting-started-with-langchain.md`

**Post Template:**
```markdown
---
title: "Your Post Title"
date: 2025-01-15 10:00:00 +0330
categories: [AI, NLP]
tags: [python, langchain, llm]
author: Ali Janloo
image: /assets/img/posts/your-image.jpg
---

Your content here...
```

**Categories for your blog:**
- AI & Machine Learning
- NLP
- Python Development
- Data Science
- Open Source
- Research

---

## 🎨 Customization Options

### **Profile Picture (Avatar)**
1. Add your photo to `/assets/img/avatar.jpg` (or any name)
2. Update `avatar: /assets/img/avatar.jpg` in `_config.yml`

### **Favicon (Browser Tab Icon)**
Replace files in `/assets/img/favicons/` with your own icons.
Use [Favicon Generator](https://realfavicongenerator.net/) to create all sizes.

### **Theme Mode**
In `_config.yml`, set:
- `theme_mode: light` - Light mode only
- `theme_mode: dark` - Dark mode only
- `theme_mode:` (empty) - Auto-detect system preference with toggle

### **Language Toggle Styling**
Edit `/assets/css/lang-toggle.css` to customize:
- Toggle switch colors
- Label styles
- RTL content behavior
- Persian font settings
