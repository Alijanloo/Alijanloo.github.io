# Language Post Handler Plugin
# This plugin helps manage bilingual posts (English and Persian)

module Jekyll
  class LanguagePostGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Add language attribute to posts based on filename
      site.posts.docs.each do |post|
        if post.data['slug']
          slug = post.data['slug']
        else
          slug = File.basename(post.path, '.*').sub(/^\d{4}-\d{2}-\d{2}-/, '')
        end

        # Check if this is a Persian post (ends with _fa)
        if slug.end_with?('_fa')
          post.data['lang'] = 'fa'
          
          # Find the corresponding English post
          english_slug = slug.sub(/_fa$/, '')
          english_post = site.posts.docs.find { |p| 
            p_slug = p.data['slug'] || File.basename(p.path, '.*').sub(/^\d{4}-\d{2}-\d{2}-/, '')
            p_slug == english_slug 
          }
          
          if english_post
            post.data['alternate_lang_url'] = english_post.url
            english_post.data['alternate_lang_url'] = post.url
          end
        else
          post.data['lang'] = 'en'
        end
      end
    end
  end

  # Add language detection from browser
  class LanguageDetector < Generator
    safe true
    priority :highest

    def generate(site)
      # Set site language if not already set
      site.config['lang'] ||= 'en'
      
      # Add available languages to site config
      site.config['languages'] = ['en', 'fa']
    end
  end
end
