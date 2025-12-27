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
 *   data-variant - Style variant (default: prominent)
 *     - prominent: Default larger inline logo (28px), bigger text
 *     - chip: Compact design with logo and text
 *     - badge: Stacked vertical layout with large logo (40px)
 *     - logo: Logo only, no text (36px)
 *     - minimal: Text only, chip appears on hover
 *     - text: Plain text link, no chip
 *   data-theme="auto|light|dark" - Color theme (default: auto-detects)
 *   data-align="center|left|right" - Alignment (default: center)
 *   data-size="small|default|large" - Size (default: default)
 *   data-position="inline|fixed" - Position mode (default: inline)
 *   data-no-track - Disable analytics tracking
 *
 * @version 2.6.0
 * @author Jacob Barkin
 * @license MIT
 */

(function() {
  'use strict';

  const VERSION = '2.6.0';
  const SITE_URL = 'https://jacobbarkin.com';

  // Analytics API endpoint (uses Cloudflare D1)
  const ANALYTICS_ENDPOINT = 'https://jacobbarkin.com/api/embed-analytics';
  const HEARTBEAT_ENDPOINT = 'https://jacobbarkin.com/api/embed-heartbeat';
  const HEARTBEAT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  const HEARTBEAT_JITTER_MS = 5 * 60 * 1000; // spread load up to 5 minutes

  let instanceCounter = 0;

  function getTrackKey(element) {
    if (!element) return 'default';
    if (element.id) return element.id;
    if (!element.__jbTrackId) {
      instanceCounter += 1;
      element.__jbTrackId = `jb-${Date.now()}-${instanceCounter}`;
    }
    return element.__jbTrackId;
  }

  function getDeviceType(width) {
    if (!width || !Number.isFinite(width)) return 'unknown';
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function getUrlParts(value) {
    try {
      const url = new URL(value);
      return {
        host: url.hostname,
        path: url.pathname || '/',
        utm_source: url.searchParams.get('utm_source'),
        utm_medium: url.searchParams.get('utm_medium'),
        utm_campaign: url.searchParams.get('utm_campaign'),
        utm_term: url.searchParams.get('utm_term'),
        utm_content: url.searchParams.get('utm_content'),
      };
    } catch {
      return null;
    }
  }

  function getEmbedMeta(element) {
    if (!element) return {};
    return {
      embed_variant: element.getAttribute('data-variant') || 'prominent',
      embed_size: element.getAttribute('data-size') || 'default',
      embed_theme: element.getAttribute('data-theme') || 'auto',
      embed_position: element.getAttribute('data-position') || 'inline',
      embed_align: element.getAttribute('data-align') || 'center',
      is_auto: element.hasAttribute('data-auto') ? 1 : 0,
      embed_instance_id: getTrackKey(element),
    };
  }

  function scheduleHeartbeat(element) {
    if (!element || element.hasAttribute('data-no-track')) return;

    const state = window.__jbHeartbeat || {
      element: null,
      timer: null,
      initialized: false,
      visibilityBound: false,
    };

    state.element = element;
    window.__jbHeartbeat = state;

    const resolveElement = () => {
      if (state.element && document.contains(state.element)) return state.element;
      const fallback = document.querySelector('jb-credit');
      if (fallback && document.contains(fallback)) return fallback;
      return null;
    };

    const sendHeartbeat = () => {
      const target = resolveElement();
      if (!target) {
        if (state.timer) {
          clearInterval(state.timer);
          state.timer = null;
        }
        return;
      }
      if (document.visibilityState === 'hidden') return;
      Analytics.heartbeat(target);
    };

    const init = () => {
      if (state.timer) return;
      const delay = 5000 + Math.floor(Math.random() * HEARTBEAT_JITTER_MS);
      setTimeout(() => {
        sendHeartbeat();
        state.timer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
      }, delay);
    };

    if (!state.initialized) {
      state.initialized = true;
      init();
    } else if (!state.timer) {
      init();
    }

    if (!state.visibilityBound) {
      state.visibilityBound = true;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          sendHeartbeat();
        }
      });
    }
  }

  // Analytics tracking (simplified for D1)
  const Analytics = {
    tracked: new Set(), // Avoid duplicate impressions per page load

    send(eventType, element, endpoint) {
      // Skip if tracking disabled
      if (element?.hasAttribute('data-no-track')) return;

      // Skip localhost/development
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host.includes('.local')) return;

      // Skip if already tracked this element for impressions (per page load)
      const trackKey = `${eventType}-${getTrackKey(element)}`;
      if (eventType === 'impression' && this.tracked.has(trackKey)) return;
      this.tracked.add(trackKey);

      const pageUrl = window.location.href.substring(0, 2048);
      const referrerUrl = (document.referrer || '').substring(0, 2048);
      const pageParts = getUrlParts(pageUrl);
      const referrerParts = getUrlParts(referrerUrl);
      const viewportWidth = window.innerWidth || null;
      const viewportHeight = window.innerHeight || null;
      const deviceType = getDeviceType(viewportWidth);
      const language = navigator.language || (navigator.languages && navigator.languages[0]) || null;
      const timezoneOffset = new Date().getTimezoneOffset();
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const connectionType = connection && connection.effectiveType ? connection.effectiveType : null;
      const embedMeta = getEmbedMeta(element);

      // Build analytics data for D1 (extended schema)
      const analyticsData = {
        page_url: pageUrl,
        page_host: pageParts ? pageParts.host : null,
        page_path: pageParts ? pageParts.path : null,
        page_title: document.title ? document.title.substring(0, 512) : null,
        referrer: referrerUrl || null,
        referrer_host: referrerParts ? referrerParts.host : null,
        utm_source: pageParts ? pageParts.utm_source : null,
        utm_medium: pageParts ? pageParts.utm_medium : null,
        utm_campaign: pageParts ? pageParts.utm_campaign : null,
        utm_term: pageParts ? pageParts.utm_term : null,
        utm_content: pageParts ? pageParts.utm_content : null,
        event_type: eventType,
        embed_version: VERSION,
        viewport_width: viewportWidth,
        viewport_height: viewportHeight,
        device_type: deviceType,
        language,
        timezone_offset: timezoneOffset,
        connection_type: connectionType,
        ...embedMeta,
      };

      const payload = JSON.stringify(analyticsData);
      const targetEndpoint = endpoint || ANALYTICS_ENDPOINT;

      // Send to D1 via API endpoint
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          const queued = navigator.sendBeacon(targetEndpoint, blob);
          if (queued) return;
        }
        fetch(targetEndpoint, {
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true,
          mode: 'cors',
        }).catch(() => {}); // Silently fail - tracking should never break the embed
      } catch {
        // Silently fail
      }
    },

    impression(element) { this.send('impression', element, ANALYTICS_ENDPOINT); },
    click(element) { this.send('click', element, ANALYTICS_ENDPOINT); },
    heartbeat(element) { this.send('heartbeat', element, HEARTBEAT_ENDPOINT); },
  };

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
      this.impressionObserver = null;
      this.impressionTracked = false;
    }

    static get observedAttributes() {
      return ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size'];
    }

    connectedCallback() {
      this.refresh();
      this.setupThemeObserver();
    }

    setupTracking() {
      // Track impression when component becomes visible
      if (!this.impressionTracked && !this.hasAttribute('data-no-track')) {
        // Use IntersectionObserver to track when actually visible
        if ('IntersectionObserver' in window) {
          if (!this.impressionObserver) {
            this.impressionObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  Analytics.impression(this);
                  this.impressionTracked = true;
                  if (this.impressionObserver) {
                    this.impressionObserver.disconnect();
                    this.impressionObserver = null;
                  }
                }
              });
            }, { threshold: 0.5 });
            this.impressionObserver.observe(this);
          }
        } else {
          // Fallback: track immediately
          Analytics.impression(this);
          this.impressionTracked = true;
        }
      }

      // Track clicks
      const chip = this.shadowRoot?.querySelector('.jb-credit-chip');
      if (chip) {
        chip.addEventListener('click', () => {
          Analytics.click(this);
        });
      }

      scheduleHeartbeat(this);
    }

    disconnectedCallback() {
      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }
      if (this.impressionObserver) {
        this.impressionObserver.disconnect();
        this.impressionObserver = null;
      }
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    attributeChangedCallback() {
      this.refresh();
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
        this.refresh();
      });

      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-mode']
      });

      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.getAttribute('data-theme') === 'auto' || !this.getAttribute('data-theme')) {
            this.refresh();
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

    refresh() {
      this.render();
      this.setupInteractivity();
      this.setupTracking();
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

      // Variant: "chip" - compact chip with full effects
      // Variant: "minimal" - no logo, chip appears on hover
      // Variant: "text" - just text, no chip at all

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

      // Variant: "badge" - larger prominent logo with stacked text
      if (variant === 'badge') {
        styles += `
        .jb-credit-chip {
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }
        .logo-icon {
          width: 40px !important;
          height: 40px !important;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.08) rotate(2deg);
        }
        .credit-text {
          font-size: 0.6875rem;
          text-align: center;
        }
`;
      }

      // Variant: "logo" - just the logo, larger and prominent
      if (variant === 'logo') {
        styles += `
        .jb-credit-chip {
          padding: 0.5rem;
          border-radius: 10px;
        }
        .logo-icon {
          width: 36px !important;
          height: 36px !important;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.1) rotate(3deg);
        }
        .credit-text { display: none; }
`;
      }

      // Variant: "prominent" - inline but with larger logo
      if (variant === 'prominent') {
        styles += `
        .jb-credit-chip {
          gap: 0.6rem;
          padding: 0.5rem 0.875rem;
        }
        .logo-icon {
          width: 28px !important;
          height: 28px !important;
          border-radius: 5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.12);
        }
        .credit-text {
          font-size: 0.8125rem;
        }
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
      const variant = this.getAttribute('data-variant') || 'prominent';
      const size = this.getAttribute('data-size') || 'default';

      // Show effects for chip and new prominent variants
      const effectVariants = ['chip', 'badge', 'logo', 'prominent'];
      const showEffects = effectVariants.includes(variant);

      // Show text for most variants (not logo-only)
      const showText = variant !== 'logo';

      this.shadowRoot.innerHTML = `
        <style>${this.getStyles(theme, position, align, variant, size)}</style>
        <div class="jb-credit-wrapper" role="contentinfo" aria-label="Site designed by Jacob Barkin">
          <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" class="jb-credit-chip" title="Visit Jacob Barkin's website">
            ${showEffects ? '<div class="glow-bg"></div>' : ''}
            ${showEffects ? '<div class="animated-border"></div>' : ''}
            ${showEffects ? '<div class="pulse-ring"></div>' : ''}
            <img class="logo-icon" src="${SITE_URL}/images/Updated%20logo.png" alt="JSB" loading="lazy" decoding="async" />
            ${showText ? `<span class="credit-text">
              Designed by <span class="credit-name">Jacob Barkin</span>
            </span>` : ''}
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
      credit.setAttribute('data-auto', '');

      // Copy attributes from script tag
      const attrs = ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size', 'data-no-track'];
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
