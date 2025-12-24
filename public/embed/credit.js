/**
 * Jacob Barkin Credit - Embeddable Web Component
 * 
 * Usage:
 *   <script src="https://jacobbarkin.com/embed/credit.js"></script>
 *   <jb-credit></jb-credit>
 * 
 * Or auto-inject at bottom of page:
 *   <script src="https://jacobbarkin.com/embed/credit.js" data-auto></script>
 * 
 * Attributes:
 *   data-theme="auto|light|dark" - Force a theme (default: auto)
 *   data-position="inline|fixed" - Position mode (default: inline)
 *   data-align="center|left|right" - Text alignment (default: center)
 *   data-variant="minimal|standard|prominent" - Style variant (default: minimal)
 * 
 * @version 1.0.0
 * @author Jacob Barkin
 * @license MIT
 */

(function() {
  'use strict';

  const VERSION = '1.0.0';
  const SITE_URL = 'https://jacobbarkin.com';
  const CREDIT_TEXT = 'Designed by Jacob Barkin';

  // Detect if we should auto-inject
  const currentScript = document.currentScript;
  const autoInject = currentScript?.hasAttribute('data-auto');

  class JBCredit extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
      return ['data-theme', 'data-position', 'data-align', 'data-variant'];
    }

    connectedCallback() {
      this.render();
      this.setupThemeObserver();
    }

    disconnectedCallback() {
      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }
    }

    attributeChangedCallback() {
      this.render();
    }

    getTheme() {
      const attr = this.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;
      
      // Auto-detect from various sources
      const html = document.documentElement;
      const body = document.body;
      
      // Check common theme class patterns
      if (html.classList.contains('dark') || body.classList.contains('dark') ||
          html.getAttribute('data-theme') === 'dark' || 
          body.getAttribute('data-theme') === 'dark' ||
          html.getAttribute('data-mode') === 'dark') {
        return 'dark';
      }
      
      // Check CSS custom properties
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background');
      if (bgColor) {
        // If background is dark, use dark theme
        const rgb = bgColor.trim();
        if (rgb.includes('0 0%') || rgb.includes('oklch(0.')) {
          return 'dark';
        }
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    }

    setupThemeObserver() {
      // Watch for theme changes on html/body
      this.themeObserver = new MutationObserver(() => {
        this.render();
      });
      
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-mode']
      });
      
      // Also watch system preference changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.getAttribute('data-theme') === 'auto' || !this.getAttribute('data-theme')) {
            this.render();
          }
        });
      }
    }

    getStyles(theme, position, align, variant) {
      const isDark = theme === 'dark';
      
      // Color schemes
      const colors = {
        light: {
          text: '#6b7280',       // gray-500
          link: '#2563eb',       // blue-600
          linkHover: '#1d4ed8',  // blue-700
          border: '#e5e7eb',     // gray-200
          bg: 'transparent'
        },
        dark: {
          text: '#9ca3af',       // gray-400
          link: '#60a5fa',       // blue-400
          linkHover: '#93c5fd',  // blue-300
          border: '#374151',     // gray-700
          bg: 'transparent'
        }
      };
      
      const c = isDark ? colors.dark : colors.light;
      
      // Base styles
      let styles = `
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .jb-credit {
          padding: 0.75rem 1rem;
          text-align: ${align};
          font-size: 0.875rem;
          color: ${c.text};
          transition: opacity 0.2s ease;
        }
        
        .jb-credit a {
          color: ${c.link};
          text-decoration: none;
          transition: color 0.2s ease, text-decoration 0.2s ease;
          font-weight: 500;
        }
        
        .jb-credit a:hover {
          color: ${c.linkHover};
          text-decoration: underline;
        }
        
        .jb-credit a:focus {
          outline: 2px solid ${c.link};
          outline-offset: 2px;
          border-radius: 2px;
        }
`;

      // Variant styles
      if (variant === 'prominent') {
        styles += `
        .jb-credit {
          padding: 1rem 1.5rem;
          border-top: 1px solid ${c.border};
          font-size: 0.875rem;
        }
`;
      } else if (variant === 'standard') {
        styles += `
        .jb-credit {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }
`;
      } else { // minimal
        styles += `
        .jb-credit {
          padding: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.8;
        }
        .jb-credit:hover {
          opacity: 1;
        }
`;
      }

      // Position styles
      if (position === 'fixed') {
        styles += `
        :host {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: ${isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
`;
      }

      // Responsive styles
      styles += `
        @media (max-width: 640px) {
          .jb-credit {
            font-size: ${variant === 'prominent' ? '0.8125rem' : '0.6875rem'};
            padding: ${variant === 'prominent' ? '0.75rem 1rem' : '0.375rem 0.5rem'};
          }
        }
`;

      return styles;
    }

    render() {
      const theme = this.getTheme();
      const position = this.getAttribute('data-position') || 'inline';
      const align = this.getAttribute('data-align') || 'center';
      const variant = this.getAttribute('data-variant') || 'minimal';

      this.shadowRoot.innerHTML = `
        <style>${this.getStyles(theme, position, align, variant)}</style>
        <div class="jb-credit" role="contentinfo">
          <span>Designed by </span>
          <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer">Jacob Barkin</a>
        </div>
      `;
    }
  }

  // Register the custom element
  if (!customElements.get('jb-credit')) {
    customElements.define('jb-credit', JBCredit);
  }

  // Auto-inject if data-auto attribute is present
  if (autoInject) {
    document.addEventListener('DOMContentLoaded', () => {
      const credit = document.createElement('jb-credit');
      
      // Copy attributes from script tag
      if (currentScript.hasAttribute('data-theme')) {
        credit.setAttribute('data-theme', currentScript.getAttribute('data-theme'));
      }
      if (currentScript.hasAttribute('data-position')) {
        credit.setAttribute('data-position', currentScript.getAttribute('data-position'));
      }
      if (currentScript.hasAttribute('data-align')) {
        credit.setAttribute('data-align', currentScript.getAttribute('data-align'));
      }
      if (currentScript.hasAttribute('data-variant')) {
        credit.setAttribute('data-variant', currentScript.getAttribute('data-variant'));
      }
      
      document.body.appendChild(credit);
    });
  }

  // Expose version
  window.JBCredit = {
    version: VERSION,
    element: JBCredit
  };

})();

