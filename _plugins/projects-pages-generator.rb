# frozen_string_literal: true

require 'nokogiri'

module Jekyll
  # Custom page class for project pages
  class ProjectPage < Page
    def initialize(site, base, dir, name, html_content, project_name)
      @site = site
      @base = base
      @dir = dir
      @name = name.sub('.html', '.md')  # Change to .md for Jekyll processing

      process(@name)
      
      # Parse the HTML content
      doc = Nokogiri::HTML(html_content)
      
      # Extract title
      title = doc.at_css('title')&.text&.strip || 
              doc.at_css('h1')&.text&.strip || 
              name.sub('.html', '').split('_').map(&:capitalize).join(' ')
      
      # Extract body content
      body = doc.at_css('body')
      content = body ? body.inner_html : html_content
      
      # Set up front matter
      self.data = {
        'layout' => 'project',
        'title' => title,
        'project_name' => project_name,
        'permalink' => "/projects/#{project_name}/#{name}"
      }
      
      # Set content
      self.content = content
    end
  end
  
  # Generator to convert project HTML files to Jekyll pages
  class ProjectPagesGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      projects_dir = File.join(site.source, '_projects')
      
      return unless Dir.exist?(projects_dir)
      
      Dir.glob(File.join(projects_dir, '*/')).each do |project_path|
        next unless File.directory?(project_path)
        
        project_name = File.basename(project_path)
        
        # Find all HTML files
        Dir.glob(File.join(project_path, '*.html')).each do |html_file|
          filename = File.basename(html_file)
          
          begin
            html_content = File.read(html_file)
            
            # Create Jekyll page from HTML
            page = ProjectPage.new(
              site,
              site.source,
              File.join('projects', project_name),
              filename,
              html_content,
              project_name
            )
            
            site.pages << page
            Jekyll.logger.info "Projects:", "Generated page for #{project_name}/#{filename}"
          rescue => e
            Jekyll.logger.error "Projects:", "Error processing #{html_file}: #{e.message}"
          end
        end
      end
    end
  end
end
