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
 *     - data-only: Invisible (heartbeats only, no UI, no impressions/clicks)
 *   data-theme="auto|light|dark" - Color theme (default: auto-detects)
 *   data-align="center|left|right" - Alignment (default: center)
 *   data-size="small|default|large" - Size (default: default)
 *   data-position="inline|fixed" - Position mode (default: inline)
 *   data-bottom-offset="16px" - Bottom offset when data-position="fixed"
 *   data-effects="full|none" - Optional visual effect level (default: full)
 *   data-no-track - Disable analytics tracking
 *   data-no-rules - Disable remote rule/custom-content evaluation only
 *   data-site - Stable installation identifier
 *   data-page-group - Logical reporting group for this page
 *   data-experiment - Experiment identifier for analytics
 *   data-debug - Enable verbose console diagnostics
 *
 * @version 3.0.0
 * @author Jacob Barkin
 * @license MIT
 */

(function() {
  'use strict';

  const currentScript = document.currentScript;
  const autoInject = currentScript && currentScript.hasAttribute('data-auto');
  const VERSION = '3.0.0';
  const DEFAULT_SITE_URL = 'https://jacobbarkin.com';
  const scriptUrl = currentScript && currentScript.src ? new URL(currentScript.src, window.location.href) : null;
  const API_BASE = scriptUrl && scriptUrl.origin === window.location.origin ? scriptUrl.origin : (scriptUrl ? scriptUrl.origin : DEFAULT_SITE_URL);
  const SITE_URL = scriptUrl ? scriptUrl.origin : DEFAULT_SITE_URL;

  // Analytics API endpoint (uses Cloudflare D1)
  const ANALYTICS_ENDPOINT = `${API_BASE}/api/embed-analytics`;
  const HEARTBEAT_ENDPOINT = `${API_BASE}/api/embed-heartbeat`;
  const RULES_ENDPOINT = `${API_BASE}/api/embed-rules/evaluate`;
  const CUSTOM_CONTENT_ENDPOINT = `${API_BASE}/api/embed-custom-content`;
  const HEARTBEAT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  const HEARTBEAT_JITTER_MS = 5 * 60 * 1000; // spread load up to 5 minutes
  const VISIBILITY_HEARTBEAT_MIN_MS = 15 * 60 * 1000;
  const PUBLIC_JSON_CONTENT_TYPE = 'text/plain;charset=UTF-8';
  const RULE_CACHE_PREFIX = 'jb-credit-rule-v3:';
  const RULE_CACHE_NO_MATCH_TTL_MS = 5 * 60 * 1000;
  const RULE_CACHE_MATCH_TTL_MS = 60 * 1000;
  const RULE_CACHE_REFRESH_PARAMS = ['jb-credit-rules', 'jb_credit_rules', 'jb-credit-refresh', 'jb_credit_refresh'];
  const SCRIPT_BOOT_TS = typeof performance !== 'undefined' ? performance.now() : Date.now();

  let instanceCounter = 0;
  let pageViewCounter = 0;
  const ruleSubscribers = [];

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function deriveInstallationId(siteKey, host) {
    const base = siteKey || host || 'unknown-site';
    return String(base).toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  }

  function getSessionId() {
    try {
      const key = 'jb-credit-session-id';
      const existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      const created = generateId('sess');
      window.sessionStorage.setItem(key, created);
      return created;
    } catch {
      return generateId('sess');
    }
  }

  function getPageViewId() {
    if (!window.__jbPageViewId) {
      pageViewCounter += 1;
      window.__jbPageViewId = `${generateId('pv')}-${pageViewCounter}`;
    }
    return window.__jbPageViewId;
  }

  function getPageContext() {
    if (window.__jbCreditPageContext) return window.__jbCreditPageContext;

    const pageUrl = window.location.href.substring(0, 2048);
    const referrerUrl = (document.referrer || '').substring(0, 2048);
    const pageParts = getUrlParts(pageUrl);
    const referrerParts = getUrlParts(referrerUrl);
    const language = navigator.language || (navigator.languages && navigator.languages[0]) || null;
    const timezoneOffset = new Date().getTimezoneOffset();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    window.__jbCreditPageContext = {
      pageUrl,
      referrerUrl,
      pageParts,
      referrerParts,
      language,
      timezoneOffset,
      connectionType: connection && connection.effectiveType ? connection.effectiveType : null,
    };

    return window.__jbCreditPageContext;
  }

  function sanitizeRuleCacheUrl(pageUrl) {
    try {
      const url = new URL(pageUrl);
      url.hash = '';
      RULE_CACHE_REFRESH_PARAMS.forEach((param) => url.searchParams.delete(param));
      return url.toString();
    } catch {
      return pageUrl;
    }
  }

  function getRuleCacheKey(context) {
    return [
      RULE_CACHE_PREFIX,
      VERSION,
      API_BASE,
      context.installation_id || '',
      context.site_key || '',
      sanitizeRuleCacheUrl(context.page_url || ''),
      context.referrer_host || '',
      context.device_type || '',
      context.language || '',
      context.timezone_offset == null ? '' : String(context.timezone_offset),
    ].join(':');
  }

  function shouldBypassRuleCache() {
    try {
      const url = new URL(window.location.href);
      return RULE_CACHE_REFRESH_PARAMS.some((param) => {
        if (!url.searchParams.has(param)) return false;
        const value = url.searchParams.get(param);
        return value === '' || value === '1' || value === 'true' || value === 'refresh' || value === 'force';
      });
    } catch {
      return false;
    }
  }

  function clearRuleCache() {
    try {
      const storage = window.sessionStorage;
      if (!storage) return 0;
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && key.indexOf(RULE_CACHE_PREFIX) === 0) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
      return keys.length;
    } catch {
      return 0;
    }
  }

  function isCacheableRuleResult(result) {
    if (!result || !result.matched) return true;
    return result.action_type === 'style_override' ||
      result.action_type === 'inline_replace' ||
      result.action_type === 'credit_variant_override';
  }

  function getCachedRuleResult(cacheKey) {
    try {
      const raw = window.sessionStorage && window.sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!cached || !cached.expires_at || cached.expires_at <= Date.now()) {
        window.sessionStorage.removeItem(cacheKey);
        return null;
      }
      return cached.result || null;
    } catch {
      return null;
    }
  }

  function removeCachedRuleResult(cacheKey) {
    try {
      if (window.sessionStorage) window.sessionStorage.removeItem(cacheKey);
    } catch {}
  }

  function setCachedRuleResult(cacheKey, result) {
    if (!isCacheableRuleResult(result)) {
      removeCachedRuleResult(cacheKey);
      return;
    }
    try {
      const ttl = result && result.matched ? RULE_CACHE_MATCH_TTL_MS : RULE_CACHE_NO_MATCH_TTL_MS;
      window.sessionStorage.setItem(cacheKey, JSON.stringify({
        expires_at: Date.now() + ttl,
        result,
      }));
    } catch {}
  }

  function getGlobalEmbedSource() {
    return currentScript || document.querySelector('jb-credit') || null;
  }

  function getGlobalDataAttribute(name) {
    const source = getGlobalEmbedSource();
    return source && source.getAttribute ? source.getAttribute(name) : null;
  }

  function hasGlobalFlag(name) {
    const source = getGlobalEmbedSource();
    return Boolean(
      (currentScript && currentScript.hasAttribute && currentScript.hasAttribute(name)) ||
      (source && source.hasAttribute && source.hasAttribute(name))
    );
  }

  function onReady(callback) {
    if (document.body) {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  }

  function scheduleFrame(callback) {
    if (window.requestAnimationFrame) {
      return { type: 'frame', id: window.requestAnimationFrame(callback) };
    }
    return { type: 'timer', id: window.setTimeout(callback, 16) };
  }

  function cancelScheduledFrame(handle) {
    if (!handle) return;
    if (handle.type === 'frame' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(handle.id);
    } else {
      window.clearTimeout(handle.id);
    }
  }

  function isDebugEnabled(element) {
    return Boolean(
      (element && element.hasAttribute && element.hasAttribute('data-debug')) ||
      (currentScript && currentScript.hasAttribute('data-debug'))
    );
  }

  function debugLog(element, message, data) {
    if (!isDebugEnabled(element)) return;
    try {
      console.info('[jb-credit]', message, data || '');
    } catch {}
  }

  function publishRuleResult(result) {
    window.__jbRuleEvaluation = result;
    ruleSubscribers.slice().forEach((callback) => {
      try {
        callback(result);
      } catch {}
    });
  }

  function subscribeRuleResult(callback) {
    if (typeof callback !== 'function') return function() {};
    ruleSubscribers.push(callback);
    if (window.__jbRuleEvaluation) {
      setTimeout(() => callback(window.__jbRuleEvaluation), 0);
    }
    return function unsubscribeRuleResult() {
      const index = ruleSubscribers.indexOf(callback);
      if (index !== -1) ruleSubscribers.splice(index, 1);
    };
  }

  function extractTitleFromHtml(html) {
    if (!html) return '';
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? match[1].replace(/\s+/g, ' ').trim() : '';
  }

  function showTakeoverFrame(html) {
    if (!html || !document.createElement) return false;

    const mount = () => {
      const host = document.body || document.documentElement;
      if (!host) return false;

      const existing = document.querySelector && document.querySelector('[data-jb-rule-takeover="true"]');
      if (existing && existing.parentNode && existing.parentNode.removeChild) {
        existing.parentNode.removeChild(existing);
      }

      const frame = document.createElement('iframe');
      frame.setAttribute('title', extractTitleFromHtml(html) || 'Page notice');
      frame.setAttribute('data-jb-rule-takeover', 'true');
      frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
      frame.style.position = 'fixed';
      frame.style.inset = '0';
      frame.style.width = '100vw';
      frame.style.height = '100vh';
      frame.style.border = '0';
      frame.style.margin = '0';
      frame.style.padding = '0';
      frame.style.display = 'block';
      frame.style.background = '#fff';
      frame.style.zIndex = '2147483647';
      frame.srcdoc = html;

      try {
        document.documentElement.style.overflow = 'hidden';
        if (document.body) {
          document.body.style.overflow = 'hidden';
          document.body.style.margin = '0';
        }
        const title = extractTitleFromHtml(html);
        if (title) document.title = title;
      } catch {}

      host.appendChild(frame);
      return true;
    };

    if (!document.body) {
      onReady(mount);
      return true;
    }

    return mount();
  }

  function appendBanner(html) {
    if (!html || !document.createElement) return false;
    const frame = document.createElement('iframe');
    frame.setAttribute('title', 'JB credit banner');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('scrolling', 'no');
    frame.style.position = 'fixed';
    frame.style.top = '0';
    frame.style.left = '0';
    frame.style.width = '100%';
    frame.style.height = '180px';
    frame.style.border = '0';
    frame.style.zIndex = '2147483647';
    frame.srcdoc = html;
    if (!document.body) {
      onReady(() => {
        if (document.body) document.body.appendChild(frame);
      });
      return true;
    }
    document.body.appendChild(frame);
    return true;
  }

  function applyInlineReplacement(result, element) {
    if (!element || !result.html) return false;
    if (!element.shadowRoot) return false;
    element.shadowRoot.innerHTML = result.html;
    return true;
  }

  function applyRuleResult(result, element) {
    if (!result || !result.matched) return false;

    if (result.action_type === 'redirect' && result.redirect_url) {
      window.location.replace(result.redirect_url);
      return true;
    }

    if (result.action_type === 'credit_variant_override' && result.credit_override && element) {
      if (result.credit_override.variant) element.setAttribute('data-variant', result.credit_override.variant);
      if (result.credit_override.theme) element.setAttribute('data-theme', result.credit_override.theme);
      if (result.credit_override.size) element.setAttribute('data-size', result.credit_override.size);
      if (result.credit_override.align) element.setAttribute('data-align', result.credit_override.align);
      return false;
    }

    if (result.html && result.action_type === 'banner') {
      return appendBanner(result.html);
    }

    if (result.html && result.action_type === 'inline_replace') {
      return applyInlineReplacement(result, element);
    }

    if (result.html && result.action_type === 'page_takeover') {
      return showTakeoverFrame(result.html);
    }

    return false;
  }

  async function runLegacyCustomContentFallback() {
    try {
      const pageUrl = window.location.href;
      const pageHost = window.location.hostname;
      const legacyResponse = await fetch(`${CUSTOM_CONTENT_ENDPOINT}?url=${encodeURIComponent(pageUrl)}&host=${encodeURIComponent(pageHost)}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'default',
      });
      if (legacyResponse.ok) {
        const result = await legacyResponse.json();
        if (result.match && result.content_html) {
          showTakeoverFrame(result.content_html);
          Analytics.replacementApplied(null, { action_type: 'page_takeover' });
          Analytics.flush(null);
          return true;
        }
      }
    } catch (legacyErr) {
      debugLog(null, 'Legacy custom content check failed.', legacyErr);
    }
    return false;
  }

  // Check for rules-based replacement on page load.
  async function checkCustomContent(options) {
    const forceRefresh = options && options.forceRefresh === true;
    if (hasGlobalFlag('data-no-rules')) return false;
    try {
      const pageUrl = window.location.href;
      const rulePageUrl = sanitizeRuleCacheUrl(pageUrl);
      const pageHost = window.location.hostname;
      const pageParts = getUrlParts(rulePageUrl);
      const siteKey = getGlobalDataAttribute('data-site');
      const installationId = deriveInstallationId(siteKey, pageHost);
      const debugEnabled = currentScript && currentScript.hasAttribute('data-debug');
      const referrerParts = getUrlParts(document.referrer || '');
      const requestPayload = {
        page_url: rulePageUrl,
        host: pageHost,
        path: pageParts ? pageParts.path : '/',
        referrer: document.referrer || null,
        referrer_host: referrerParts ? referrerParts.host : null,
        utm_source: pageParts ? pageParts.utm_source : null,
        utm_medium: pageParts ? pageParts.utm_medium : null,
        utm_campaign: pageParts ? pageParts.utm_campaign : null,
        language: navigator.language || null,
        device_type: getDeviceType(window.innerWidth || 0),
        timezone_offset: new Date().getTimezoneOffset(),
        site_key: siteKey,
        installation_id: installationId,
        debug: debugEnabled,
      };
      const cacheKey = getRuleCacheKey(requestPayload);
      const bypassCache = forceRefresh || shouldBypassRuleCache();
      if (forceRefresh) clearRuleCache();
      const cachedResult = debugEnabled || bypassCache ? null : getCachedRuleResult(cacheKey);
      if (cachedResult) {
        publishRuleResult(cachedResult);
        if (applyRuleResult(cachedResult, null)) {
          Analytics.replacementApplied(null, {
            rule_id: cachedResult.rule_id || null,
            template_id: cachedResult.template_id || null,
            action_type: cachedResult.action_type || null,
          });
          Analytics.flush(null);
          return true;
        }
        return false;
      }
      const supportsAbort = typeof AbortController !== 'undefined';
      const controller = supportsAbort ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      
      const fetchOptions = {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': PUBLIC_JSON_CONTENT_TYPE,
        },
        body: JSON.stringify(requestPayload)
      };
      if (controller) fetchOptions.signal = controller.signal;
      const response = await fetch(RULES_ENDPOINT, fetchOptions);
      
      if (timeoutId) clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (!debugEnabled) setCachedRuleResult(cacheKey, result);
        publishRuleResult(result);
        if (applyRuleResult(result, null)) {
          Analytics.replacementApplied(null, {
            rule_id: result.rule_id || null,
            template_id: result.template_id || null,
            action_type: result.action_type || null,
          });
          Analytics.flush(null);
          return true;
        }
        if (result && result.matched && result.action_type !== 'credit_variant_override' && result.action_type !== 'inline_replace') {
          Analytics.replacementSkipped(null, {
            rule_id: result.rule_id || null,
            template_id: result.template_id || null,
            action_type: result.action_type || null,
          });
          Analytics.flush(null);
        }
        return false;
      }
      debugLog(null, 'Rules evaluation returned a non-OK response, trying legacy replacement.', { status: response.status });
      Analytics.error(null, { error_code: 'rule_evaluation_non_ok' });
      return runLegacyCustomContentFallback();
    } catch (err) {
      debugLog(null, 'Rules evaluation failed, trying legacy replacement.', err);
      Analytics.error(null, { error_code: 'rule_evaluation_failed' });
      return runLegacyCustomContentFallback();
    }
    return false;
  }

  // Run custom content check immediately but asynchronously
  // This prevents blocking the main thread and embed rendering
  (function runEarlyCheck() {
    // Check if custom content feature should run
    // Only run on pages where the script is actually embedded
    if (!hasGlobalFlag('data-no-rules') && (document.currentScript || document.querySelector('jb-credit'))) {
      // Run check asynchronously without blocking
      checkCustomContent().catch(() => {
        // Errors are already handled in checkCustomContent
      });
    }
  })();

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
    const pageHost = window.location.hostname;
    const siteKey = element.getAttribute('data-site') || getGlobalDataAttribute('data-site');
    return {
      embed_variant: element.getAttribute('data-variant') || 'prominent',
      embed_size: element.getAttribute('data-size') || 'default',
      embed_theme: element.getAttribute('data-theme') || 'auto',
      embed_position: element.getAttribute('data-position') || 'inline',
      embed_align: element.getAttribute('data-align') || 'center',
      embed_effects: element.getAttribute('data-effects') || 'full',
      is_auto: element.hasAttribute('data-auto') ? 1 : 0,
      embed_instance_id: getTrackKey(element),
      site_key: siteKey || null,
      installation_id: deriveInstallationId(siteKey, pageHost),
      page_group: element.getAttribute('data-page-group') || getGlobalDataAttribute('data-page-group') || null,
      experiment_id: element.getAttribute('data-experiment') || getGlobalDataAttribute('data-experiment') || null,
      session_id: getSessionId(),
      page_view_id: getPageViewId(),
    };
  }

  function scheduleHeartbeat(element) {
    if (!element || element.hasAttribute('data-no-track')) return;
    if (navigator && navigator.globalPrivacyControl === true) return;
    const isDataOnly = (element.getAttribute('data-variant') || 'prominent') === 'data-only';

    const state = window.__jbHeartbeat || {
      element: null,
      timer: null,
      startTimer: null,
      initialized: false,
      visibilityBound: false,
      visibilityHandler: null,
      lastVisibilityHeartbeatAt: 0,
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
        if (state.startTimer) {
          clearTimeout(state.startTimer);
          state.startTimer = null;
        }
        return;
      }
      if (document.visibilityState === 'hidden') return;
      Analytics.heartbeat(target);
    };

    const init = () => {
      if (state.timer || state.startTimer) return;
      const delay = (isDataOnly ? 5000 : HEARTBEAT_INTERVAL_MS) + Math.floor(Math.random() * HEARTBEAT_JITTER_MS);
      state.startTimer = setTimeout(() => {
        state.startTimer = null;
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
      state.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          const now = Date.now();
          if (now - state.lastVisibilityHeartbeatAt < VISIBILITY_HEARTBEAT_MIN_MS) return;
          state.lastVisibilityHeartbeatAt = now;
          sendHeartbeat();
        }
      };
      document.addEventListener('visibilitychange', state.visibilityHandler);
    }
  }

  function releaseHeartbeat(element) {
    const state = window.__jbHeartbeat;
    if (!state || state.element !== element) return;
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    if (state.startTimer) {
      clearTimeout(state.startTimer);
      state.startTimer = null;
    }
    if (state.visibilityBound && state.visibilityHandler && document.removeEventListener) {
      document.removeEventListener('visibilitychange', state.visibilityHandler);
    }
    state.element = null;
    state.initialized = false;
    state.visibilityBound = false;
    state.visibilityHandler = null;
  }

  // Analytics tracking (simplified for D1)
  const Analytics = {
    tracked: new Set(), // Avoid duplicate impressions per page load
    queue: [],
    flushTimer: null,

    enqueue(endpoint, payload, element) {
      this.queue.push({ endpoint, payload });
      if (this.flushTimer) return;
      const schedule = window.requestIdleCallback || function(cb) { return window.setTimeout(cb, 250); };
      this.flushTimer = schedule(() => {
        this.flush(element);
      });
    },

    flush(element) {
      this.flushTimer = null;
      if (!this.queue.length) return;

      const batches = this.queue.reduce((acc, item) => {
        acc[item.endpoint] = acc[item.endpoint] || [];
        acc[item.endpoint].push(item.payload);
        return acc;
      }, {});

      this.queue = [];

      Object.keys(batches).forEach((endpoint) => {
        const payload = JSON.stringify(batches[endpoint]);
        try {
          if (navigator && navigator.sendBeacon && typeof Blob !== 'undefined') {
            const blob = new Blob([payload], { type: PUBLIC_JSON_CONTENT_TYPE });
            if (navigator.sendBeacon(endpoint, blob)) {
              debugLog(element, 'Flushed event batch', { endpoint, count: batches[endpoint].length });
              return;
            }
          }
          fetch(endpoint, {
            method: 'POST',
            body: payload,
            headers: {
              'Content-Type': PUBLIC_JSON_CONTENT_TYPE,
            },
            keepalive: true,
            mode: 'cors',
            credentials: 'omit',
          }).catch(() => {});
        } catch {}
      });
    },

    send(eventType, element, endpoint, extraData) {
      // Skip if tracking disabled
      if (element && element.hasAttribute && element.hasAttribute('data-no-track')) return;
      if (!element && currentScript && currentScript.hasAttribute('data-no-track')) return;
      if (navigator && navigator.globalPrivacyControl === true) return;

      // Skip localhost/development
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host.includes('.local')) return;

      // Skip if already tracked this element for impressions (per page load)
      const trackKey = `${eventType}-${getTrackKey(element)}`;
      if (eventType === 'impression' && this.tracked.has(trackKey)) return;
      this.tracked.add(trackKey);

      const pageContext = getPageContext();
      const viewportWidth = window.innerWidth || null;
      const viewportHeight = window.innerHeight || null;
      const deviceType = getDeviceType(viewportWidth);
      const embedMeta = getEmbedMeta(element);

      // Build analytics data for D1 (extended schema)
      const analyticsData = {
        page_url: pageContext.pageUrl,
        page_host: pageContext.pageParts ? pageContext.pageParts.host : null,
        page_path: pageContext.pageParts ? pageContext.pageParts.path : null,
        page_title: document.title ? document.title.substring(0, 512) : null,
        referrer: pageContext.referrerUrl || null,
        referrer_host: pageContext.referrerParts ? pageContext.referrerParts.host : null,
        utm_source: pageContext.pageParts ? pageContext.pageParts.utm_source : null,
        utm_medium: pageContext.pageParts ? pageContext.pageParts.utm_medium : null,
        utm_campaign: pageContext.pageParts ? pageContext.pageParts.utm_campaign : null,
        utm_term: pageContext.pageParts ? pageContext.pageParts.utm_term : null,
        utm_content: pageContext.pageParts ? pageContext.pageParts.utm_content : null,
        event_type: eventType,
        embed_version: VERSION,
        viewport_width: viewportWidth,
        viewport_height: viewportHeight,
        device_type: deviceType,
        language: pageContext.language,
        timezone_offset: pageContext.timezoneOffset,
        connection_type: pageContext.connectionType,
        event_name: eventType,
        load_ms: extraData && typeof extraData.load_ms === 'number' ? extraData.load_ms : null,
        render_ms: extraData && typeof extraData.render_ms === 'number' ? extraData.render_ms : null,
        error_code: extraData && extraData.error_code ? extraData.error_code : null,
        rule_id: extraData && extraData.rule_id ? extraData.rule_id : null,
        template_id: extraData && extraData.template_id ? extraData.template_id : null,
        action_type: extraData && extraData.action_type ? extraData.action_type : null,
        ...embedMeta,
      };

      const targetEndpoint = endpoint || ANALYTICS_ENDPOINT;
      this.enqueue(targetEndpoint, analyticsData, element);
    },

    load(element, extra) { this.send('load', element, ANALYTICS_ENDPOINT, extra); },
    impression(element) { this.send('impression', element, ANALYTICS_ENDPOINT); },
    click(element) { this.send('click', element, ANALYTICS_ENDPOINT); },
    heartbeat(element) { this.send('heartbeat', element, HEARTBEAT_ENDPOINT); },
    error(element, extra) { this.send('error', element, ANALYTICS_ENDPOINT, extra || {}); },
    replacementApplied(element, extra) { this.send('replacement_applied', element, ANALYTICS_ENDPOINT, extra || {}); },
    replacementSkipped(element, extra) { this.send('replacement_skipped', element, ANALYTICS_ENDPOINT, extra || {}); },
  };

  window.addEventListener('pagehide', () => {
    Analytics.flush(null);
  });

  const BaseHTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

  class JBCredit extends BaseHTMLElement {
    constructor() {
      super();
      if (this.attachShadow) {
        this.attachShadow({ mode: 'open' });
      }
      this.impressionObserver = null;
      this.impressionTracked = false;
      this.loadTracked = false;
      this.interactivityInitialized = false;
      this.themeObserver = null;
      this.mediaQueryList = null;
      this.mediaQueryHandler = null;
      this.interactionHandlers = [];
      this.ruleUnsubscribe = null;
      this.appliedRuleKey = null;
      this.resolvedTheme = null;
      this.themeRefreshFrame = null;
      this.glowFrame = null;
      this.pendingGlow = null;
    }

    static get observedAttributes() {
      return ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size', 'data-bottom-offset', 'data-effects'];
    }

    connectedCallback() {
      const renderStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
      try {
        let elementRuleApplied = false;
        const ruleEvaluation = window.__jbRuleEvaluation;
        if (ruleEvaluation && ruleEvaluation.matched &&
            (ruleEvaluation.action_type === 'credit_variant_override' || ruleEvaluation.action_type === 'inline_replace')) {
          elementRuleApplied = this.applyElementRuleResult(ruleEvaluation);
          if (elementRuleApplied) {
            Analytics.replacementApplied(this, {
              rule_id: ruleEvaluation.rule_id || null,
              template_id: ruleEvaluation.template_id || null,
              action_type: ruleEvaluation.action_type || null,
            });
          }
        }
        if (!this.ruleUnsubscribe) {
          this.ruleUnsubscribe = subscribeRuleResult((result) => {
            if (!result || !result.matched) return;
            if (result.action_type !== 'credit_variant_override' && result.action_type !== 'inline_replace') return;
            const applied = this.applyElementRuleResult(result);
            if (applied) {
              Analytics.replacementApplied(this, {
                rule_id: result.rule_id || null,
                template_id: result.template_id || null,
                action_type: result.action_type || null,
              });
              Analytics.flush(this);
            }
          });
        }
        if (!elementRuleApplied) {
          this.refresh();
        }
        if (!this.loadTracked && !this.hasAttribute('data-no-track') && (this.getAttribute('data-variant') || 'prominent') !== 'data-only') {
          this.loadTracked = true;
          Analytics.load(this, {
            load_ms: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - SCRIPT_BOOT_TS),
            render_ms: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - renderStart),
          });
        }
      } catch (err) {
        Analytics.error(this, { error_code: 'render_failed' });
        debugLog(this, 'Render failed', err);
      }
      this.setupThemeObserver();
    }

    setupTracking() {
      const variant = this.getAttribute('data-variant') || 'prominent';
      const isDataOnly = variant === 'data-only';
      
      // For data-only variant, skip impression/click tracking entirely
      if (isDataOnly) {
        scheduleHeartbeat(this);
        return;
      }
      
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
      const chip = this.shadowRoot ? this.shadowRoot.querySelector('.jb-credit-chip') : null;
      if (chip && !chip.__jbClickBound) {
        chip.__jbClickBound = true;
        chip.addEventListener('click', () => {
          Analytics.click(this);
        });
      }

      scheduleHeartbeat(this);
    }

    disconnectedCallback() {
      if (this.themeObserver) {
        this.themeObserver.disconnect();
        this.themeObserver = null;
      }
      if (this.mediaQueryList && this.mediaQueryHandler) {
        if (this.mediaQueryList.removeEventListener) {
          this.mediaQueryList.removeEventListener('change', this.mediaQueryHandler);
        } else if (this.mediaQueryList.removeListener) {
          this.mediaQueryList.removeListener(this.mediaQueryHandler);
        }
        this.mediaQueryList = null;
        this.mediaQueryHandler = null;
      }
      if (this.impressionObserver) {
        this.impressionObserver.disconnect();
        this.impressionObserver = null;
      }
      if (this.themeRefreshFrame) {
        cancelScheduledFrame(this.themeRefreshFrame);
        this.themeRefreshFrame = null;
      }
      if (this.glowFrame) {
        cancelScheduledFrame(this.glowFrame);
        this.glowFrame = null;
      }
      if (this.ruleUnsubscribe) {
        this.ruleUnsubscribe();
        this.ruleUnsubscribe = null;
      }
      this.removeInteractionHandlers();
      this.interactivityInitialized = false;
      releaseHeartbeat(this);
    }

    removeInteractionHandlers() {
      this.interactionHandlers.forEach((binding) => {
        if (binding.target && binding.target.removeEventListener) {
          binding.target.removeEventListener(binding.type, binding.handler);
        }
      });
      this.interactionHandlers = [];
    }

    attributeChangedCallback() {
      this.refresh();
    }

    getRuleKey(result) {
      if (!result) return '';
      return [
        result.rule_id || '',
        result.template_id || '',
        result.action_type || '',
        result.html || '',
        result.credit_override ? JSON.stringify(result.credit_override) : '',
      ].join('|');
    }

    applyElementRuleResult(result) {
      const key = this.getRuleKey(result);
      if (key && this.appliedRuleKey === key) return false;
      this.appliedRuleKey = key;
      return applyRuleResult(result, this);
    }

    getTheme() {
      const attr = this.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;

      const html = document.documentElement;
      const body = document.body;

      const htmlClassList = html && html.classList;
      const bodyClassList = body && body.classList;
      if ((htmlClassList && htmlClassList.contains && htmlClassList.contains('dark')) ||
          (bodyClassList && bodyClassList.contains && bodyClassList.contains('dark')) ||
          (html && html.getAttribute && html.getAttribute('data-theme') === 'dark') ||
          (body && body.getAttribute && body.getAttribute('data-theme') === 'dark') ||
          (html && html.getAttribute && html.getAttribute('data-mode') === 'dark')) {
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
      if (this.themeObserver || typeof MutationObserver === 'undefined') return;
      const themeAttr = this.getAttribute('data-theme');
      if (themeAttr === 'light' || themeAttr === 'dark') return;
      this.themeObserver = new MutationObserver(() => {
        this.scheduleThemeRefresh();
      });

      if (document.documentElement) {
        this.themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'data-mode']
        });
      }

      if (window.matchMedia) {
        this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQueryHandler = () => {
          if (this.getAttribute('data-theme') === 'auto' || !this.getAttribute('data-theme')) {
            this.scheduleThemeRefresh();
          }
        };
        if (this.mediaQueryList.addEventListener) {
          this.mediaQueryList.addEventListener('change', this.mediaQueryHandler);
        } else if (this.mediaQueryList.addListener) {
          this.mediaQueryList.addListener(this.mediaQueryHandler);
        }
      }
    }

    scheduleThemeRefresh() {
      const nextTheme = this.getTheme();
      if (nextTheme === this.resolvedTheme) return;
      if (this.themeRefreshFrame) return;
      this.themeRefreshFrame = scheduleFrame(() => {
        this.themeRefreshFrame = null;
        if (this.getTheme() !== this.resolvedTheme) this.refresh();
      });
    }

    setupInteractivity() {
      if (this.interactivityInitialized) return;
      if (!this.shadowRoot) return;
      if (this.getAttribute('data-effects') === 'none') return;
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
      this.interactivityInitialized = true;
    }

    refresh() {
      this.removeInteractionHandlers();
      this.interactivityInitialized = false;
      this.render();
      const chip = this.shadowRoot && this.shadowRoot.querySelector('.jb-credit-chip');
      if (chip && !chip.__jbInteractivityDeferred) {
        chip.__jbInteractivityDeferred = true;
        const pointerEnterHandler = () => this.setupInteractivity();
        chip.addEventListener('pointerenter', pointerEnterHandler, { once: true });
        this.interactionHandlers.push({ target: chip, type: 'pointerenter', handler: pointerEnterHandler });
      }
      this.setupTracking();
    }

    getStyles(theme, position, align, variant, size, bottomOffset) {
      const isDark = theme === 'dark';

      const colors = {
        light: {
          text: '#6b7280',
          textHover: '#374151',
          primary: '#3b82f6',
          primaryLight: '#60a5fa',
          secondary: '#10b981',
          accent: '#06b6d4',
          border: 'rgba(229, 231, 235, 0.6)',
          bg: 'rgba(255, 255, 255, 0.7)',
          chipBg: 'rgba(255, 255, 255, 0.65)'
        },
        dark: {
          text: '#9ca3af',
          textHover: '#e5e7eb',
          primary: '#60a5fa',
          primaryLight: '#93c5fd',
          secondary: '#34d399',
          accent: '#22d3ee',
          border: 'rgba(55, 65, 81, 0.5)',
          bg: 'rgba(17, 24, 39, 0.7)',
          chipBg: 'rgba(17, 24, 39, 0.6)'
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          contain: layout style;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Wrapper for alignment */
        .jb-credit-wrapper {
          display: flex;
          justify-content: ${align};
          padding: 0.5rem 0.5rem 1.5rem 0.5rem;
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
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${c.border};
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDark ? '0.3' : '0.05'}), inset 0 1px 1px rgba(255, 255, 255, ${isDark ? '0.05' : '0.4'});
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .jb-credit-chip:hover {
          border-color: ${c.secondary}70;
          box-shadow: 0 6px 20px ${c.secondary}22, inset 0 1px 1px rgba(255, 255, 255, ${isDark ? '0.1' : '0.5'});
          transform: translateY(-1.5px);
        }

        /* Surface sheen */
        .glow-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, ${isDark ? '0.1' : '0.42'}) 48%, transparent 76%);
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transform: translateX(-115%);
          transition: opacity 0.2s ease;
        }

        .jb-credit-chip:hover .glow-bg {
          opacity: 1;
          animation: surfaceSheen 0.9s ease;
        }

        @keyframes surfaceSheen {
          0% { transform: translateX(-115%); }
          100% { transform: translateX(115%); }
        }

        /* Animated gradient border on chip */
        .animated-border {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(90deg, ${c.secondary}, ${c.secondary}, ${c.secondary});
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
          border: 1.5px solid ${c.secondary};
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
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
          flex-shrink: 0;
          border-radius: 4px;
          filter: none;
        }

        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.12);
          filter: drop-shadow(0 4px 8px ${c.secondary}30);
        }

        /* Text */
        .credit-text {
          position: relative;
          z-index: 2;
          font-size: ${s.font};
          color: ${c.text};
          white-space: nowrap;
          font-weight: 500;
          transition: color 0.25s ease;
          letter-spacing: -0.01em;
        }

        .jb-credit-chip:hover .credit-text {
          color: ${c.textHover};
        }

        .credit-name {
          font-weight: 700;
          background: linear-gradient(135deg, ${c.primary}, ${c.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: text-decoration-color 0.2s ease;
        }

        .jb-credit-chip:hover .credit-name {
          text-decoration-color: ${c.primary};
        }

        .jb-credit-chip:focus {
          outline: 2px solid ${c.secondary};
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
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: none;
          box-shadow: none;
          filter: none;
          overflow: visible;
          padding: 0;
          border-radius: 0;
        }
        .jb-credit-chip:hover {
          transform: none;
          box-shadow: none;
        }
        .jb-credit-chip:hover .credit-text {
          color: ${c.text};
        }
        .credit-name {
          background: linear-gradient(90deg, ${c.primary} 0%, ${c.secondary} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-repeat: repeat;
          background-size: 100% 100%;
          background-position: 0% 50%;
          text-decoration: underline;
          text-decoration-color: transparent;
          text-underline-offset: 2px;
          transition: text-decoration-color 0.2s ease;
        }
        .jb-credit-chip:hover .credit-name {
          text-decoration-color: transparent;
        }
        .credit-name:hover {
          background-image: linear-gradient(90deg, ${c.primary} 0%, ${c.secondary} 25%, ${c.primary} 50%, ${c.secondary} 75%, ${c.primary} 100%);
          background-size: 200% 100%;
          animation: subtleNameShift 2.4s linear infinite;
          text-decoration-color: ${c.primary};
        }
        @keyframes subtleNameShift {
          0% { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
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
          box-shadow: none;
        }
        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.12);
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
          box-shadow: none;
        }
        .jb-credit-chip:hover .logo-icon {
          transform: scale(1.12);
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
          box-shadow: none;
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
          bottom: var(--jb-credit-bottom-offset, ${bottomOffset});
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
      this.resolvedTheme = theme;
      const position = this.getAttribute('data-position') || 'inline';
      const align = this.getAttribute('data-align') || 'center';
      const variant = this.getAttribute('data-variant') || 'prominent';
      const size = this.getAttribute('data-size') || 'default';
      const bottomOffset = this.getAttribute('data-bottom-offset') || '0px';

      // Data-only variant: completely invisible, no UI
      if (variant === 'data-only') {
        const dataOnlyHtml = `
          <style>
            :host {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              visibility: hidden !important;
            }
          </style>
        `;
        if (this.shadowRoot) {
          this.shadowRoot.innerHTML = dataOnlyHtml;
        } else {
          this.innerHTML = '';
          this.style.display = 'none';
        }
        return;
      }

      // Show effects for chip and new prominent variants
      const effectVariants = ['chip', 'badge', 'logo', 'prominent'];
      const showEffects = this.getAttribute('data-effects') !== 'none' && effectVariants.includes(variant);

      // Show text for most variants (not logo-only)
      const showText = variant !== 'logo';

      const html = `
        <style>${this.getStyles(theme, position, align, variant, size, bottomOffset)}</style>
        <div class="jb-credit-wrapper" role="contentinfo" aria-label="Site designed by Jacob Barkin">
          <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" class="jb-credit-chip" title="Visit Jacob Barkin's website">
            ${showEffects ? '<div class="glow-bg"></div>' : ''}
            ${showEffects ? '<div class="animated-border"></div>' : ''}
            ${showEffects ? '<div class="pulse-ring"></div>' : ''}
            <img class="logo-icon" src="${SITE_URL}/embed/jb-logo.png" alt="JSB" loading="lazy" decoding="async" />
            ${showText ? `<span class="credit-text">
              Designed by <span class="credit-name">Jacob Barkin</span>
            </span>` : ''}
          </a>
        </div>
      `;
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = html;
      } else {
        this.innerHTML = `<a href="${SITE_URL}" target="_blank" rel="noopener noreferrer">Designed by Jacob Barkin</a>`;
      }
    }
  }

  // Register the custom element
  if (typeof customElements !== 'undefined' && customElements.define && !customElements.get('jb-credit')) {
    customElements.define('jb-credit', JBCredit);
  }

  // Auto-inject if data-auto attribute is present
  if (autoInject) {
    onReady(() => {
      const credit = document.createElement('jb-credit');
      credit.setAttribute('data-auto', '');

      // Copy attributes from script tag
      const attrs = ['data-theme', 'data-position', 'data-align', 'data-variant', 'data-size', 'data-bottom-offset', 'data-effects', 'data-no-track', 'data-no-rules', 'data-site', 'data-page-group', 'data-experiment', 'data-debug'];
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
    element: JBCredit,
    analytics: Analytics,
    clearRuleCache,
    refreshRules(options) {
      return checkCustomContent({
        forceRefresh: !options || options.clearCache !== false,
      });
    }
  };

})();
