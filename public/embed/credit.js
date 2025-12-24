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
 *   data-variant="chip|minimal|text|logo-prominent|initials-badge|company-name|gradient-logo|icon-initials|stacked|logo-only|brand-bar" - Style variant (default: chip)
 *   data-theme="auto|light|dark" - Color theme (default: auto-detects)
 *   data-align="center|left|right" - Alignment (default: center)
 *   data-size="small|default|large" - Size (default: default)
 *   data-position="inline|fixed" - Position mode (default: inline)
 *
 * @version 2.2.0
 * @author Jacob Barkin
 * @license MIT
 */

(function() {
  'use strict';

  const VERSION = '2.2.0';
  const SITE_URL = 'https://jacobbarkin.com';

  // Detect if we should auto-inject
  const currentScript = document.currentScript;
  const autoInject = currentScript?.hasAttribute('data-auto');

  class JBCredit extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.animationFrame = null;
      this.gradientPosition = { x: 0, y: 0 };
      this.isHovered = false;
    }

    static get observedAttributes() {
      return ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size'];
    }

    connectedCallback() {
      this.render();
      this.setupThemeObserver();
      this.setupInteractivity();
    }

    disconnectedCallback() {
      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    attributeChangedCallback() {
      this.render();
      this.setupInteractivity();
    }

    getTheme() {
      const attr = this.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;

      const html = document.documentElement;
      const body = document.body;

      if (html.classList.contains('dark') || body.classList.contains('dark') ||
          html.getAttribute('data-theme') === 'dark' ||
          body.getAttribute('data-theme') === 'dark' ||
          html.getAttribute('data-mode') === 'dark') {
        return 'dark';
      }

      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background');
      if (bgColor) {
        const rgb = bgColor.trim();
        if (rgb.includes('0 0%') || rgb.includes('oklch(0.')) {
          return 'dark';
        }
      }

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }

      return 'light';
    }

    setupThemeObserver() {
      this.themeObserver = new MutationObserver(() => {
        this.render();
        this.setupInteractivity();
      });

      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-mode']
      });

      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.getAttribute('data-theme') === 'auto' || !this.getAttribute('data-theme')) {
            this.render();
            this.setupInteractivity();
          }
        });
      }
    }

    setupInteractivity() {
      const chip = this.shadowRoot.querySelector('.jb-credit-chip');
      const glowBg = this.shadowRoot.querySelector('.glow-bg');

      if (!chip || !glowBg) return;

      // Get theme for glow color
      const isDark = this.getTheme() === 'dark';
      const glowColor = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.35)';

      // Mouse move for glow follow effect on the chip
      chip.addEventListener('mousemove', (e) => {
        const rect = chip.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Immediate update, no transition on the background itself
        glowBg.style.background = `radial-gradient(80px circle at ${x}px ${y}px, ${glowColor}, transparent 70%)`;
      });

      chip.addEventListener('mouseleave', () => {
        glowBg.style.background = 'transparent';
      });
    }

    getStyles(theme, position, align, variant, size) {
      const isDark = theme === 'dark';

      const colors = {
        light: {
          text: '#6b7280',
          textHover: '#374151',
          primary: '#3b82f6',
          primaryLight: '#60a5fa',
          secondary: '#10b981',
          accent: '#06b6d4',
          border: '#e5e7eb',
          bg: 'rgba(255, 255, 255, 0.95)',
          chipBg: 'rgba(255, 255, 255, 0.95)'
        },
        dark: {
          text: '#9ca3af',
          textHover: '#e5e7eb',
          primary: '#60a5fa',
          primaryLight: '#93c5fd',
          secondary: '#34d399',
          accent: '#22d3ee',
          border: '#374151',
          bg: 'rgba(17, 24, 39, 0.95)',
          chipBg: 'rgba(17, 24, 39, 0.95)'
        }
      };

      const c = isDark ? colors.dark : colors.light;

      // Size configurations
      const sizes = {
        small: { font: '0.6875rem', padding: '0.25rem 0.5rem', gap: '0.25rem', logo: '12px' },
        default: { font: '0.75rem', padding: '0.4rem 0.75rem', gap: '0.4rem', logo: '16px' },
        large: { font: '0.875rem', padding: '0.5rem 1rem', gap: '0.5rem', logo: '20px' }
      };
      const s = sizes[size] || sizes.default;

      let styles = `
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          contain: content;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Wrapper for alignment */
        .jb-credit-wrapper {
          display: flex;
          justify-content: ${align};
          padding: 0.25rem;
        }

        /* The chip element */
        .jb-credit-chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: ${s.gap};
          padding: ${s.padding};
          border-radius: 9999px;
          background: ${c.chipBg};
          border: 1px solid ${c.border};
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .jb-credit-chip:hover {
          border-color: ${c.primary}60;
          box-shadow: 0 0 12px ${c.primary}20, 0 2px 6px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        /* Mouse-follow glow */
        .glow-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .jb-credit-chip:hover .glow-bg {
          opacity: 1;
        }

        .jb-credit-chip:hover .glow-bg {
          opacity: 1;
        }

        /* Animated gradient border on chip */
        .animated-border {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(90deg, ${c.primary}, ${c.secondary}, ${c.accent}, ${c.primary});
          background-size: 300% 100%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }

        .jb-credit-chip:hover .animated-border {
          opacity: 1;
          animation: gradientFlow 2s linear infinite;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }



        /* Pulse ring for prominent */
        .pulse-ring {
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          border: 1.5px solid ${c.primary};
          opacity: 0;
          pointer-events: none;
        }

        .jb-credit-chip:hover .pulse-ring {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        /* Logo icon */
        .logo-icon {
          position: relative;
          z-index: 2;
          width: ${s.logo};
          height: ${s.logo};
          object-fit: contain;
          transition: transform 0.25s ease;
          flex-shrink: 0;
          border-radius: 2px;
        }

        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.1);
        }

        /* Text */
        .credit-text {
          position: relative;
          z-index: 2;
          font-size: ${s.font};
          color: ${c.text};
          white-space: nowrap;
          transition: color 0.25s ease;
        }

        .jb-credit-chip:hover .credit-text {
          color: ${c.textHover};
        }

        .credit-name {
          font-weight: 600;
          background: linear-gradient(135deg, ${c.primary}, ${c.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .jb-credit-chip:focus {
          outline: 2px solid ${c.primary};
          outline-offset: 2px;
        }
`;

      // Variant: "chip" (default) - logo + full effects
      // Variant: "minimal" - no logo, chip appears on hover
      // Variant: "text" - just text, no chip at all
      // NEW BRAND VARIANTS:
      // Variant: "logo-prominent" - larger logo with minimal text
      // Variant: "initials-badge" - JB in stylized badge
      // Variant: "company-name" - Ask The Kidz with logo
      // Variant: "gradient-logo" - logo in gradient circle
      // Variant: "icon-initials" - combined approach
      // Variant: "stacked" - logo above text
      // Variant: "logo-only" - just logo with tooltip
      // Variant: "brand-bar" - full-width branded bar

      if (variant === 'logo-prominent') {
        styles += `
        .logo-icon {
          width: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
          height: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
        }
        .credit-text {
          font-size: ${s.font === '0.6875rem' ? '0.625rem' : s.font === '0.75rem' ? '0.6875rem' : '0.75rem'};
        }
`;
      }

      if (variant === 'initials-badge') {
        styles += `
        .logo-icon { display: none; }
        .initials-badge {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
          height: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
          border-radius: 8px;
          background: linear-gradient(135deg, ${c.primary}, ${c.secondary}, ${c.accent});
          color: white;
          font-weight: 700;
          font-size: ${s.font === '0.6875rem' ? '0.625rem' : s.font === '0.75rem' ? '0.6875rem' : '0.75rem'};
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .jb-credit-chip:hover .initials-badge {
          transform: scale(1.1) rotate(5deg);
        }
`;
      }

      if (variant === 'company-name') {
        styles += `
        .credit-text .company-name {
          display: inline;
          font-weight: 700;
          background: linear-gradient(135deg, ${c.accent}, ${c.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
`;
      }

      if (variant === 'gradient-logo') {
        styles += `
        .logo-icon { display: none; }
        .gradient-logo-wrapper {
          position: relative;
          z-index: 2;
          width: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
          height: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
          border-radius: 50%;
          background: linear-gradient(135deg, ${c.primary}, ${c.secondary}, ${c.accent});
          padding: ${s.logo === '12px' ? '4px' : s.logo === '16px' ? '5px' : '6px'};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .gradient-logo-wrapper img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
        .jb-credit-chip:hover .gradient-logo-wrapper {
          transform: scale(1.1);
        }
`;
      }

      if (variant === 'icon-initials') {
        styles += `
        .logo-icon {
          width: ${s.logo === '12px' ? '18px' : s.logo === '16px' ? '24px' : '30px'};
          height: ${s.logo === '12px' ? '18px' : s.logo === '16px' ? '24px' : '30px'};
        }
        .initials-text {
          font-weight: 700;
          font-size: ${s.font === '0.6875rem' ? '0.75rem' : s.font === '0.75rem' ? '0.875rem' : '1rem'};
          background: linear-gradient(135deg, ${c.primary}, ${c.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-left: -0.125rem;
        }
`;
      }

      if (variant === 'stacked') {
        styles += `
        .jb-credit-chip {
          flex-direction: column;
          gap: ${s.gap === '0.25rem' ? '0.375rem' : s.gap === '0.4rem' ? '0.5rem' : '0.625rem'};
          padding: ${s.padding === '0.25rem 0.5rem' ? '0.5rem 0.75rem' : s.padding === '0.4rem 0.75rem' ? '0.625rem 1rem' : '0.75rem 1.25rem'};
        }
        .logo-icon {
          width: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
          height: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
        }
        .credit-text {
          text-align: center;
        }
`;
      }

      if (variant === 'logo-only') {
        styles += `
        .credit-text { display: none; }
        .jb-credit-chip {
          padding: ${s.padding === '0.25rem 0.5rem' ? '0.375rem' : s.padding === '0.4rem 0.75rem' ? '0.5rem' : '0.625rem'};
        }
        .logo-icon {
          width: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
          height: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
        }
`;
      }

      if (variant === 'brand-bar') {
        styles += `
        .jb-credit-chip {
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          background: linear-gradient(135deg, ${c.primary}15, ${c.secondary}10, ${c.accent}15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .brand-bar-content {
          display: flex;
          align-items: center;
          gap: ${s.gap};
          width: 100%;
        }
        .logo-icon {
          width: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
          height: ${s.logo === '12px' ? '24px' : s.logo === '16px' ? '32px' : '40px'};
        }
        .brand-divider {
          width: 1px;
          height: ${s.logo === '12px' ? '20px' : s.logo === '16px' ? '28px' : '36px'};
          background: linear-gradient(to bottom, transparent, ${c.border}, transparent);
        }
`;
      }

      if (variant === 'minimal') {
        styles += `
        .jb-credit-chip {
          background: transparent;
          border: none;
          padding: 0.125rem 0.25rem;
        }
        .jb-credit-chip:hover {
          background: ${c.chipBg};
          border: 1px solid ${c.border};
          padding: ${s.padding};
        }
        .logo-icon { display: none; }
        .animated-border { display: none; }
        .pulse-ring { display: none; }
        .glow-bg { display: none; }
`;
      }

      if (variant === 'text') {
        styles += `
        .jb-credit-chip {
          background: transparent;
          border: none;
          padding: 0;
          border-radius: 0;
        }
        .jb-credit-chip:hover {
          transform: none;
          box-shadow: none;
        }
        .credit-name {
          text-decoration: underline;
          text-decoration-color: ${c.primary}40;
          text-underline-offset: 2px;
          transition: text-decoration-color 0.2s ease;
        }
        .jb-credit-chip:hover .credit-name {
          text-decoration-color: ${c.primary};
        }
        .logo-icon { display: none; }
        .animated-border { display: none; }
        .pulse-ring { display: none; }
        .glow-bg { display: none; }
`;
      }

      if (position === 'fixed') {
        styles += `
        :host {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
        }
        .jb-credit-wrapper {
          background: ${c.bg};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid ${c.border};
          padding: 0.5rem;
        }
`;
      }

      styles += `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
`;

      return styles;
    }

    render() {
      const theme = this.getTheme();
      const position = this.getAttribute('data-position') || 'inline';
      const align = this.getAttribute('data-align') || 'center';
      const variant = this.getAttribute('data-variant') || 'chip';
      const size = this.getAttribute('data-size') || 'default';

      // Show effects only for chip variant and new brand variants (not minimal or text)
      const showEffects = variant === 'chip' || variant === 'logo-prominent' || 
                          variant === 'initials-badge' || variant === 'company-name' ||
                          variant === 'gradient-logo' || variant === 'icon-initials' ||
                          variant === 'stacked' || variant === 'logo-only' || variant === 'brand-bar';

      // Generate content based on variant
      let content = '';
      
      if (variant === 'initials-badge') {
        content = `
          <div class="initials-badge">JB</div>
          <span class="credit-text">
            Designed by <span class="credit-name">Jacob Barkin</span>
          </span>
        `;
      } else if (variant === 'company-name') {
        content = `
          <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
          <span class="credit-text">
            Designed by <span class="company-name">Ask The Kidz</span>
          </span>
        `;
      } else if (variant === 'gradient-logo') {
        content = `
          <div class="gradient-logo-wrapper">
            <img src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
          </div>
          <span class="credit-text">
            Designed by <span class="credit-name">Jacob Barkin</span>
          </span>
        `;
      } else if (variant === 'icon-initials') {
        content = `
          <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
          <span class="initials-text">JB</span>
          <span class="credit-text">
            Designed by <span class="credit-name">Jacob Barkin</span>
          </span>
        `;
      } else if (variant === 'stacked') {
        content = `
          <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
          <span class="credit-text">
            Designed by <span class="credit-name">Jacob Barkin</span>
          </span>
        `;
      } else if (variant === 'logo-only') {
        content = `
          <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
        `;
      } else if (variant === 'brand-bar') {
        content = `
          <div class="brand-bar-content">
            <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
            <div class="brand-divider"></div>
            <span class="credit-text">
              Designed by <span class="credit-name">Jacob Barkin</span>
            </span>
          </div>
        `;
      } else {
        // Default content for chip, minimal, text, logo-prominent
        content = `
          <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="" width="16" height="16" loading="lazy" decoding="async" />
          <span class="credit-text">
            Designed by <span class="credit-name">Jacob Barkin</span>
          </span>
        `;
      }

      this.shadowRoot.innerHTML = `
        <style>${this.getStyles(theme, position, align, variant, size)}</style>
        <div class="jb-credit-wrapper" role="contentinfo" aria-label="Site designed by Jacob Barkin">
          <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" class="jb-credit-chip" title="Visit Jacob Barkin's website">
            ${showEffects ? '<div class="glow-bg"></div>' : ''}
            ${showEffects ? '<div class="animated-border"></div>' : ''}
            ${showEffects ? '<div class="pulse-ring"></div>' : ''}
            ${content}
          </a>
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
      const attrs = ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size'];
      attrs.forEach(attr => {
        if (currentScript.hasAttribute(attr)) {
          credit.setAttribute(attr, currentScript.getAttribute(attr));
        }
      });

      document.body.appendChild(credit);
    });
  }

  // Expose version
  window.JBCredit = {
    version: VERSION,
    element: JBCredit
  };

})();

