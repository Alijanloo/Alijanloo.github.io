# frozen_string_literal: true

require 'fileutils'

module Jekyll
  # Hook to copy non-HTML assets from _projects directory to _site/projects
  Jekyll::Hooks.register :site, :post_write do |site|
    projects_source = File.join(site.source, '_projects')
    projects_dest = File.join(site.dest, 'projects')
    
    if Dir.exist?(projects_source)
      FileUtils.mkdir_p(projects_dest) unless Dir.exist?(projects_dest)
      
      Dir.glob(File.join(projects_source, '*')).each do |project_path|
        next unless File.directory?(project_path)
        
        project_name = File.basename(project_path)
        dest_path = File.join(projects_dest, project_name)
        
        FileUtils.mkdir_p(dest_path) unless Dir.exist?(dest_path)
        
        # Copy only non-HTML files (images, CSS, JS, etc.)
        Dir.glob(File.join(project_path, '**/*')).each do |file|
          next if File.directory?(file)
          next if file.end_with?('.html')  # Skip HTML files as they're processed by Jekyll
          
          relative_path = file.sub(project_path + '/', '')
          dest_file = File.join(dest_path, relative_path)
          
          FileUtils.mkdir_p(File.dirname(dest_file))
          FileUtils.cp(file, dest_file)
        end
        
        Jekyll.logger.info "Projects:", "Copied assets for #{project_name}"
      end
    end
  end
end
