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
    
    // For all other pages, just reload to apply the language filter
    window.location.reload();
  };

  /**
   * Apply language attribute based on language
   */
  function applyLanguage(lang) {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
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
   * Filter posts, categories, and tags by language
   */
  function filterContentByLanguage(lang) {
    // Filter post list items (home page)
    const postItems = document.querySelectorAll('article.card-wrapper[data-lang]');
    postItems.forEach(item => {
      const itemLang = item.getAttribute('data-lang') || 'en';
      if (itemLang !== lang) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });
    
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
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }

})();
