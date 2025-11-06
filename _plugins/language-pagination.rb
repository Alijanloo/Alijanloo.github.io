# Language-Aware Pagination Plugin
# This plugin creates separate pagination for English and Persian posts

module Jekyll
  class LanguagePagination < Generator
    safe true
    priority :low

    def generate(site)
      # Get posts by language
      en_posts = site.posts.docs.select { |post| (post.data['lang'] || 'en') == 'en' }
      fa_posts = site.posts.docs.select { |post| (post.data['lang'] || 'en') == 'fa' }
      
      # Paginate English posts
      paginate_posts_by_language(site, en_posts, 'en')
      
      # Paginate Persian posts  
      paginate_posts_by_language(site, fa_posts, 'fa')
    end

    private

    def paginate_posts_by_language(site, posts, lang)
      per_page = site.config['paginate'] || 10
      total_posts = posts.length
      total_pages = (total_posts.to_f / per_page).ceil
      
      # Create pagination data for each language
      (1..total_pages).each do |page_num|
        start_index = (page_num - 1) * per_page
        end_index = [start_index + per_page - 1, total_posts - 1].min
        page_posts = posts[start_index..end_index] || []
        
        # Create pagination info
        pagination_info = {
          'page' => page_num,
          'per_page' => per_page,
          'posts' => page_posts,
          'total_posts' => total_posts,
          'total_pages' => total_pages,
          'previous_page' => page_num > 1 ? page_num - 1 : nil,
          'previous_page_path' => page_num > 1 ? (page_num == 2 ? "/#{lang}/" : "/#{lang}/page#{page_num - 1}/") : nil,
          'next_page' => page_num < total_pages ? page_num + 1 : nil,
          'next_page_path' => page_num < total_pages ? "/#{lang}/page#{page_num + 1}/" : nil
        }
        
        # Store in site data for JavaScript access
        site.data["pagination_#{lang}"] ||= {}
        site.data["pagination_#{lang}"]["page_#{page_num}"] = pagination_info
      end
    end
  end

  # Liquid filter for language-aware pagination
  module LanguagePaginationFilter
    def paginate_by_lang(posts, lang, page = 1, per_page = 10)
      return [] unless posts && lang
      
      # Filter posts by language
      lang_posts = posts.select { |post| (post['lang'] || 'en') == lang }
      
      # Calculate pagination
      start_index = (page - 1) * per_page
      end_index = start_index + per_page - 1
      
      lang_posts[start_index..end_index] || []
    end
    
    def pagination_info(posts, lang, page = 1, per_page = 10)
      return {} unless posts && lang
      
      # Filter posts by language
      lang_posts = posts.select { |post| (post['lang'] || 'en') == lang }
      total_posts = lang_posts.length
      total_pages = (total_posts.to_f / per_page).ceil
      
      {
        'page' => page,
        'per_page' => per_page,
        'total_posts' => total_posts,
        'total_pages' => total_pages,
        'previous_page' => page > 1 ? page - 1 : nil,
        'next_page' => page < total_pages ? page + 1 : nil
      }
    end
  end
end

Liquid::Template.register_filter(Jekyll::LanguagePaginationFilter)