# 📁 Project Structure - Ali Janloo's Blog

This is a Jekyll-based blog using the **Chirpy** theme. This guide will help you understand the project structure and where to make edits.

---

## 🌳 Project Tree Overview

```
Alijanloo.github.io/
├── _config.yml              # Main site configuration (IMPORTANT!)
├── _data/
│   ├── contact.yml          # Social media links in sidebar
│   └── share.yml            # Social sharing options
├── _posts/                  # Your blog posts go here
│   └── .placeholder         # Empty - add posts in YYYY-MM-DD-title.md format
├── _tabs/                   # Static pages accessible from sidebar
│   ├── about.md             # About page (customize with your bio)
│   ├── archives.md          # Archive page (auto-generated)
│   ├── categories.md        # Categories page (auto-generated)
│   └── tags.md              # Tags page (auto-generated)
├── _plugins/                # Jekyll plugins
├── assets/
│   ├── img/
│   │   └── favicons/        # Website favicon images
│   └── lib/                 # External libraries
├── tools/
│   ├── run.sh               # Local development server script
│   └── test.sh              # Build for production script
├── index.html               # Homepage layout
├── Gemfile                  # Ruby dependencies
└── README.md                # Project documentation
```

---

## 📝 Files to Edit for Personalization

### 🔧 **Essential Configuration Files**

#### 1. `_config.yml` (Main Configuration)
**Priority: HIGH** - This is the most important file!

**What to customize:**
- `title`: Your site title (e.g., "Ali Janloo")
- `tagline`: Site subtitle/description
- `description`: SEO meta description
- `url`: Your website URL (e.g., "https://alijanloo.github.io")
- `github.username`: Your GitHub username
- `twitter.username`: Your Twitter/X username
- `social.name`: Your full name
- `social.email`: Your email address
- `social.links`: Links to your social profiles
- `avatar`: Path to your profile picture (e.g., `/assets/img/avatar.jpg`)
- `timezone`: Your timezone (e.g., "Asia/Tehran")

#### 2. `_data/contact.yml` (Sidebar Social Links)
**Priority: HIGH**

**What to customize:**
- Add/update social media links shown in the sidebar
- Uncomment LinkedIn section and add your LinkedIn URL
- Update GitHub, Twitter, Email links
- Can add Stack Overflow, Reddit, etc.

#### 3. `_tabs/about.md` (About Page)
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

---

## 🚀 Development Workflow

### **Local Development**
```bash
# Run the development server
./tools/run.sh

# Or use VS Code task: "Run Jekyll Server"
```

The site will be available at `http://localhost:4000`

### **Build for Production**
```bash
./tools/test.sh

# Or use VS Code task: "Build Jekyll Site"
```

### **Deploy**
Commit and push to GitHub. If GitHub Pages is enabled, it will auto-deploy.

---

## 📋 Customization Checklist

Use this checklist to personalize your blog:

### Phase 1: Basic Information
- [ ] Update `_config.yml` with your name, email, username
- [ ] Set correct `url` and `baseurl` in `_config.yml`
- [ ] Configure `timezone` in `_config.yml`
- [ ] Update `_data/contact.yml` with social links
- [ ] Add LinkedIn to `_data/contact.yml`

### Phase 2: Content
- [ ] Write your `_tabs/about.md` page
- [ ] Add your profile picture as avatar
- [ ] Replace favicon images
- [ ] Update `README.md` with project details

### Phase 3: Styling (Optional)
- [ ] Choose theme mode (light/dark)
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Set up comments system (Disqus, Giscus, etc.)
- [ ] Add custom CSS if needed

### Phase 4: Content Creation
- [ ] Write your first blog post
- [ ] Add post images to `/assets/img/posts/`
- [ ] Create categories and tags structure
- [ ] Add sample projects or portfolio items

---

## 🔍 Key Features of Chirpy Theme

- ✅ Responsive design
- ✅ Dark/Light theme toggle
- ✅ Code syntax highlighting
- ✅ Table of Contents (TOC) in posts
- ✅ Categories and tags
- ✅ Search functionality
- ✅ SEO optimized
- ✅ PWA support (installable)
- ✅ Comments support (optional)
- ✅ Analytics integration

---

## 📚 Additional Resources

- [Chirpy Theme Documentation](https://github.com/cotes2020/jekyll-theme-chirpy/wiki)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Font Awesome Icons](https://fontawesome.com/icons) (for social icons)

---

## 🐛 Troubleshooting

**Issue:** Changes not showing up?
- **Solution:** Restart the Jekyll server (`Ctrl+C` then `./tools/run.sh` again)

**Issue:** Build errors?
- **Solution:** Check `_config.yml` syntax (use YAML validator)

**Issue:** CSS not loading?
- **Solution:** Clear browser cache or try incognito mode

---

**Happy Blogging! 🚀**

*Last Updated: October 18, 2025*
