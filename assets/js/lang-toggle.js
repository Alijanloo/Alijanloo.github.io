/**
 * Language Toggle Functionality
 * Supports Persian (fa) and English (en) with browser detection
 */

(function() {
  'use strict';

  const LANG_KEY = 'language-preference';
  const SUPPORTED_LANGS = ['en', 'fa'];
  const DEFAULT_LANG = 'en';

  /**
   * Detect browser language
   */
  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if browser language is Persian
    if (browserLang.toLowerCase().startsWith('fa') || 
        browserLang.toLowerCase().startsWith('persian')) {
      return 'fa';
    }
    
    return DEFAULT_LANG;
  }

  /**
   * Get current language from localStorage or detect from browser
   */
  function getCurrentLanguage() {
    let lang = localStorage.getItem(LANG_KEY);
    
    if (!lang) {
      // First visit - detect from browser
      lang = detectBrowserLanguage();
      localStorage.setItem(LANG_KEY, lang);
    }
    
    return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  }

  /**
   * Set language preference
   */
  function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  /**
   * Toggle language
   */
  window.toggleLanguage = function() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'fa' : 'en';
    
    // Save the new language preference
    setLanguage(newLang);
    
    // Check if we're on a post page
    const currentPath = window.location.pathname;
    const postMatch = currentPath.match(/\/posts\/([^\/]+)\/?$/);
    
    if (postMatch) {
      const postSlug = postMatch[1];
      
      // Try to switch to the alternate language version of the post
      if (currentLang === 'en' && !postSlug.endsWith('_fa')) {
        // Try to go to Persian version
        const persianUrl = `/posts/${postSlug}_fa/`;
        window.location.href = persianUrl;
        return;
      } else if (currentLang === 'fa' && postSlug.endsWith('_fa')) {
        // Go to English version
        const englishSlug = postSlug.replace(/_fa$/, '');
        const englishUrl = `/posts/${englishSlug}/`;
        window.location.href = englishUrl;
        return;
      }
    }
    
    // Check if we're on the about page
    if (currentPath.includes('/about')) {
      if (currentLang === 'en') {
        window.location.href = '/about_fa/';
      } else {
        window.location.href = '/about/';
      }
      return;
    }
    
    // For all other pages, just reload to apply the language filter
    window.location.reload();
  };

  /**
   * Apply language attribute based on language
   */
  function applyLanguage(lang) {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
    
    // Update site title
    const titleEn = document.querySelector('.title-en');
    const titleFa = document.querySelector('.title-fa');
    if (titleEn && titleFa) {
      if (lang === 'fa') {
        titleEn.style.display = 'none';
        titleFa.style.display = 'inline';
      } else {
        titleEn.style.display = 'inline';
        titleFa.style.display = 'none';
      }
    }
    
    // Update tab texts
    const tabTexts = document.querySelectorAll('.tab-text');
    tabTexts.forEach(tab => {
      const enText = tab.getAttribute('data-en');
      const faText = tab.getAttribute('data-fa');
      if (enText && faText) {
        tab.textContent = lang === 'fa' ? faText : enText;
      }
    });
    
    // Hide/show language-specific tabs
    filterTabs(lang);
  }
  
  /**
   * Filter tabs based on language
   */
  function filterTabs(lang) {
    const navItems = document.querySelectorAll('#sidebar .nav-item');
    navItems.forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Check if this is a language-specific tab (like about/about_fa)
      if (href.includes('/about_fa/')) {
        // Persian about page - show only in Persian mode
        item.style.display = lang === 'fa' ? '' : 'none';
      } else if (href.includes('/about/') && !href.includes('/about_fa/')) {
        // English about page - show only in English mode
        item.style.display = lang === 'en' ? '' : 'none';
      }
    });
  }

  /**
   * Update toggle switch state
   */
  function updateToggleSwitch(lang) {
    const toggleCheckbox = document.querySelector('.lang-toggle input[type="checkbox"]');
    if (toggleCheckbox) {
      toggleCheckbox.checked = (lang === 'fa');
    }
  }

  /**
   * Initialize language on page load
   */
  function initLanguage() {
    // Check if we're on a Persian post (URL ends with _fa)
    const currentPath = window.location.pathname;
    const isFaPost = currentPath.match(/\/posts\/[^\/]+_fa\/?$/);
    
    let currentLang;
    
    if (isFaPost) {
      // We're on a Persian post
      currentLang = 'fa';
      setLanguage('fa'); // Save preference
    } else {
      // Get language from localStorage or browser detection
      currentLang = getCurrentLanguage();
    }
    
    // Apply language
    applyLanguage(currentLang);
    
    // Update toggle switch state
    updateToggleSwitch(currentLang);
    
    // Filter content by language
    filterContentByLanguage(currentLang);
  }

  /**
   * Filter posts, categories, and tags by language with pagination
   */
  function filterContentByLanguage(lang) {
    // Update current language for pagination
    if (window.languagePagination) {
      // Only reset page if language changed
      if (window.languagePagination.currentLang !== lang) {
        window.languagePagination.currentLang = lang;
        window.languagePagination.currentPage = 1; // Reset to first page when switching language
      }
    }
    
    // Filter and paginate post list items (home page)
    const postItems = document.querySelectorAll('article.card-wrapper[data-lang]');
    const postsPerPage = window.languagePagination?.postsPerPage || 10;
    
    // Get posts for current language
    const langPosts = Array.from(postItems).filter(item => {
      const itemLang = item.getAttribute('data-lang') || 'en';
      return itemLang === lang;
    });
    
    // Hide all posts first
    postItems.forEach(item => {
      item.style.display = 'none';
    });
    
    // Show posts for current page
    if (langPosts.length > 0) {
      const currentPage = window.languagePagination?.currentPage || 1;
      const startIndex = (currentPage - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const currentPagePosts = langPosts.slice(startIndex, endIndex);
      
      currentPagePosts.forEach(item => {
        item.style.display = '';
      });
      
      // Update pagination controls
      updatePaginationControls(langPosts.length, postsPerPage, currentPage, lang);
    } else {
      // No posts for this language, hide pagination
      const paginationControls = document.getElementById('pagination-controls');
      if (paginationControls) {
        paginationControls.style.display = 'none';
      }
    }
    
    // Filter category items
    const categoryItems = document.querySelectorAll('[data-category-lang]');
    categoryItems.forEach(item => {
      const itemLang = item.getAttribute('data-category-lang') || 'en';
      if (itemLang !== lang) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });
    
    // Filter tag items
    const tagItems = document.querySelectorAll('[data-tag-lang]');
    tagItems.forEach(item => {
      const itemLang = item.getAttribute('data-tag-lang') || 'en';
      if (itemLang !== lang) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });
    
    // Filter archive items
    const archiveItems = document.querySelectorAll('[data-post-lang]');
    archiveItems.forEach(item => {
      const itemLang = item.getAttribute('data-post-lang') || 'en';
      if (itemLang !== lang) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });
    
    // Update tab links for language-specific pages
    updateTabLinks(lang);
  }
  
  /**
   * Update pagination controls
   */
  function updatePaginationControls(totalPosts, postsPerPage, currentPage, lang) {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const paginationControls = document.getElementById('pagination-controls');
    const paginationList = document.getElementById('pagination-list');
    
    if (!paginationList || totalPages <= 1) {
      if (paginationControls) {
        paginationControls.style.display = 'none';
      }
      return;
    }
    
    paginationControls.style.display = '';
    paginationList.innerHTML = '';
    
    // Previous button
    if (currentPage > 1) {
      const prevItem = createPaginationItem('‹', currentPage - 1, lang, false);
      paginationList.appendChild(prevItem);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = createPaginationItem(i.toString(), i, lang, i === currentPage);
      paginationList.appendChild(pageItem);
    }
    
    // Next button
    if (currentPage < totalPages) {
      const nextItem = createPaginationItem('›', currentPage + 1, lang, false);
      paginationList.appendChild(nextItem);
    }
  }
  
  /**
   * Create pagination item
   */
  function createPaginationItem(text, page, lang, isActive) {
    const li = document.createElement('li');
    li.className = 'page-item' + (isActive ? ' active' : '');
    
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = text;
    a.setAttribute('data-page', page);
    
    a.addEventListener('click', function(e) {
      e.preventDefault();
      goToPage(page, lang);
    });
    
    li.appendChild(a);
    return li;
  }
  
  /**
   * Go to specific page
   */
  window.goToPage = function(page, lang) {
    if (window.languagePagination) {
      window.languagePagination.currentPage = page;
    }
    
    // Re-filter content with new page
    filterContentByLanguage(lang);
    
    // Scroll to top of post list
    const postList = document.getElementById('post-list');
    if (postList) {
      postList.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  /**
   * Update tab links to point to language-specific versions
   */
  function updateTabLinks(lang) {
    // Update About link
    const aboutLinks = document.querySelectorAll('a[href="/about/"], a[href="/about_fa/"]');
    aboutLinks.forEach(link => {
      if (lang === 'fa') {
        link.setAttribute('href', '/about_fa/');
      } else {
        link.setAttribute('href', '/about/');
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }

})();
