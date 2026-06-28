// UI translation strings, ported from the Jekyll _data/locales files.
export const strings = {
  en: {
    site: {
      title: "Ali Janloo",
      tagline: "ML Engineer | NLP Enthusiast | AI Developer",
    },
    tabs: {
      home: "HOME",
      categories: "CATEGORIES",
      tags: "TAGS",
      archives: "ARCHIVES",
      about: "ABOUT",
      projects: "PROJECTS",
      movies: "MOVIES",
    },
    layout: { post: "Post", category: "Category", tag: "Tag" },
    panel: {
      lastmod: "Recently Updated",
      trending_tags: "Trending Tags",
      toc: "Contents",
    },
    post: {
      written_by: "By",
      posted: "Posted",
      read_more: "Read more",
      categories: "Categories",
      tags: "Tags",
      relatedPosts: "Further Reading",
    },
    home: { all_posts: "All Posts" },
    misc: {
      pinned: "Pinned",
      page_not_found: "Page not found",
      back_home: "Back to home",
      no_posts: "No posts here yet.",
    },
  },
  fa: {
    site: {
      title: "علی جانلو",
      tagline:
        "مهندس یادگیری ماشین | علاقه‌مند به پردازش زبان طبیعی | توسعه‌دهنده هوش مصنوعی",
    },
    tabs: {
      home: "خانه",
      categories: "دسته‌بندی‌ها",
      tags: "برچسب‌ها",
      archives: "آرشیو",
      about: "درباره من",
      projects: "پروژه‌ها",
      movies: "فیلم‌ها",
    },
    layout: { post: "نوشته", category: "دسته‌بندی", tag: "برچسب" },
    panel: {
      lastmod: "به‌روزرسانی اخیر",
      trending_tags: "برچسب‌های پرطرفدار",
      toc: "فهرست مطالب",
    },
    post: {
      written_by: "نوشته",
      posted: "منتشر شده",
      read_more: "ادامه مطلب",
      categories: "دسته‌بندی‌ها",
      tags: "برچسب‌ها",
      relatedPosts: "مطالب مرتبط",
    },
    home: { all_posts: "همه نوشته‌ها" },
    misc: {
      pinned: "سنجاق‌شده",
      page_not_found: "صفحه پیدا نشد",
      back_home: "بازگشت به خانه",
      no_posts: "هنوز نوشته‌ای اینجا نیست.",
    },
  },
};

export function t(lang, path) {
  const parts = path.split(".");
  let cur = strings[lang] || strings.en;
  for (const p of parts) {
    cur = cur?.[p];
  }
  if (cur == null) {
    // fall back to English
    cur = strings.en;
    for (const p of parts) cur = cur?.[p];
  }
  return cur ?? path;
}
