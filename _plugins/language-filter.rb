# Language Filter Plugin
# Filters posts, categories, and tags based on current language

module Jekyll
  module LanguageFilter
    # Filter posts by language
    def posts_by_lang(posts, lang)
      return posts unless lang
      
      posts.select do |post|
        post_lang = post.data['lang'] || 'en'
        post_lang == lang
      end
    end
    
    # Filter categories by language
    def categories_by_lang(categories, lang)
      return categories unless lang
      
      filtered = {}
      categories.each do |category, posts|
        lang_posts = posts_by_lang(posts, lang)
        filtered[category] = lang_posts unless lang_posts.empty?
      end
      filtered
    end
    
    # Filter tags by language
    def tags_by_lang(tags, lang)
      return tags unless lang
      
      filtered = {}
      tags.each do |tag, posts|
        lang_posts = posts_by_lang(posts, lang)
        filtered[tag] = lang_posts unless lang_posts.empty?
      end
      filtered
    end
    
    # Get language from localStorage via JavaScript
    def current_lang
      'en' # Default, will be overridden by JavaScript
    end
  end
end

Liquid::Template.register_filter(Jekyll::LanguageFilter)
