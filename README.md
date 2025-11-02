# Ali Janloo's Personal Blog

[![Website](https://img.shields.io/badge/Website-alijanloo.github.io-blue)](https://alijanloo.github.io)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.x-red.svg)](https://jekyllrb.com/)
[![Theme](https://img.shields.io/badge/Theme-Chirpy-success.svg)](https://github.com/cotes2020/jekyll-theme-chirpy)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Welcome to the source code of my personal blog! This site is built with Jekyll using the beautiful Chirpy theme, where I share insights about AI, machine learning, NLP, and software development.

## 🎯 About This Blog

This is my personal space to:
- 🤖 Share knowledge about **Machine Learning & NLP**
- 🐍 Write tutorials on **Python Development**
- 📊 Discuss **Data Science** techniques and tools
- 🔬 Summarize and implement **AI Research**
- 🛠️ Showcase **Open Source Projects**

### 🌐 Multilingual Support

This blog supports **bilingual content** (English and Persian):
- 🔄 **Automatic language detection** from browser settings
- 🌍 **Manual language toggle** in the sidebar
- 📝 **Parallel posts** in both languages (English/Persian)
- 🎨 **RTL support** for Persian content with proper fonts

See [MULTILINGUAL_GUIDE.md](MULTILINGUAL_GUIDE.md) for detailed instructions on creating bilingual posts.

## 🚀 Quick Start

### Prerequisites
- Ruby 2.7+ ([installation guide](https://www.ruby-lang.org/en/documentation/installation/))
- Jekyll 4.x
- Bundler

### Local Development
```bash
# Install dependencies
bundle install

# Run local server
./tools/run.sh

# Or alternatively
bundle exec jekyll serve
```

Visit `http://localhost:4000` to preview the site.

### Build for Production
```bash
./tools/test.sh
```

## 📁 Project Structure

See [project_tree.md](project_tree.md) for a detailed guide on the project structure and how to customize the blog.

## 📝 Writing Posts

Create new posts in `_posts/` directory with the naming format:
```
YYYY-MM-DD-post-title.md
```

Example post structure:
```markdown
---
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS +TIMEZONE
categories: [Category1, Category2]
tags: [tag1, tag2, tag3]
author: Ali Janloo
---

Your content here...
```

### Creating Bilingual Posts

For Persian version of a post, create a file with `_fa` suffix:
```
_posts/YYYY-MM-DD-post-title.md        # English version
_posts/YYYY-MM-DD-post-title_fa.md     # Persian version
```

Persian post front matter:
```markdown
---
title: "عنوان پست به فارسی"
date: YYYY-MM-DD HH:MM:SS +TIMEZONE
categories: [دسته‌بندی۱, دسته‌بندی۲]
tags: [برچسب۱, برچسب۲]
author: علی جانلو
lang: fa
dir: rtl
---

محتوای فارسی...
```

See [MULTILINGUAL_GUIDE.md](MULTILINGUAL_GUIDE.md) for complete guide.

## 🎨 Customization

Key files to customize:
- `_config.yml` - Site configuration
- `_data/contact.yml` - Social media links
- `_tabs/about.md` - About page
- `assets/img/avatar.jpg` - Profile picture (add your own)
- `assets/img/favicons/` - Browser icons

## 📚 Theme Documentation

This blog uses the **Chirpy** theme. For detailed theme documentation:
- [Chirpy Theme Wiki](https://github.com/cotes2020/jekyll-theme-chirpy/wiki)
- [Jekyll Documentation](https://jekyllrb.com/docs/)

## 🌐 Deployment

This site is automatically deployed to GitHub Pages on push to the main branch.

## 📬 Contact

Feel free to reach out!

- 💼 [LinkedIn](https://www.linkedin.com/in/ali-janloo/)
- 🐙 [GitHub](https://github.com/Alijanloo)
- 📧 [Email](mailto:mahmoodjanlooali@gmail.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Chirpy theme is also under MIT License.

---

**Made with ❤️ by Ali Janloo**
