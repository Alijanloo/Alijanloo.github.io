# frozen_string_literal: true

require 'nokogiri'

module Jekyll
  # Generator to scan _projects directory and extract navigation items
  class ProjectsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      projects = []
      projects_dir = File.join(site.source, '_projects')
      
      return unless Dir.exist?(projects_dir)
      
      Dir.glob(File.join(projects_dir, '*/')).each do |project_path|
        next unless File.directory?(project_path)
        
        project_name = File.basename(project_path)
        
        # Find all HTML files in the project directory
        html_files = Dir.glob(File.join(project_path, '*.html'))
        
        next if html_files.empty?
        
        nav_items = []
        
        # Create navigation items from all HTML files
        html_files.sort.each do |file_path|
          filename = File.basename(file_path)
          
          # Parse HTML to get title
          begin
            doc = Nokogiri::HTML(File.read(file_path))
            title = doc.at_css('title')&.text&.strip || 
                   doc.at_css('h1')&.text&.strip || 
                   filename.sub('.html', '').split('_').map(&:capitalize).join(' ')
            
            # Clean up title
            title = title.split('_').map(&:capitalize).join(' ') if title == filename.sub('.html', '')
            
            # Create URL
            url = if filename == 'index.html'
                    "/projects/#{project_name}/"
                  else
                    "/projects/#{project_name}/#{filename}"
                  end
            
            nav_items << {
              'title' => title,
              'url' => url,
              'filename' => filename
            }
          rescue => e
            Jekyll.logger.warn "Projects:", "Error parsing #{file_path}: #{e.message}"
          end
        end
        
        # Get project title from index.html or directory name
        project_title = project_name.split(/[-_]/).map(&:capitalize).join(' ')
        
        projects << {
          'name' => project_name,
          'title' => project_title,
          'url' => "/projects/#{project_name}/",
          'nav_items' => nav_items
        }
      end
      
      site.config['projects'] = projects
      Jekyll.logger.info "Projects:", "Found #{projects.size} project(s)"
    end
  end
end
