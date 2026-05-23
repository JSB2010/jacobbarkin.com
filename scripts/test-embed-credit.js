const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(repoRoot, "public/embed/credit.js");
const authoredScriptPath = path.join(repoRoot, "src/embed/credit.js");
const buildEmbedPath = path.join(repoRoot, "scripts/build-embed.mjs");
const middlewarePath = path.join(repoRoot, "src/middleware.ts");
const rulesPath = path.join(repoRoot, "src/lib/embed/rules.ts");
const rulesManagerPath = path.join(repoRoot, "src/components/admin/embed-rules-manager.tsx");
const analyticsRoutePath = path.join(repoRoot, "src/app/api/embed-analytics/route.ts");
const heartbeatRoutePath = path.join(repoRoot, "src/app/api/embed-heartbeat/route.ts");
const telemetryIngestionPath = path.join(repoRoot, "src/lib/embed/ingestion.ts");
const nextConfigPath = path.join(repoRoot, "next.config.mjs");
const source = fs.readFileSync(scriptPath, "utf8");
const authoredSource = fs.existsSync(authoredScriptPath) ? fs.readFileSync(authoredScriptPath, "utf8") : "";
const buildEmbedSource = fs.existsSync(buildEmbedPath) ? fs.readFileSync(buildEmbedPath, "utf8") : "";
const middlewareSource = fs.readFileSync(middlewarePath, "utf8");
const rulesSource = fs.readFileSync(rulesPath, "utf8");
const rulesManagerSource = fs.readFileSync(rulesManagerPath, "utf8");
const analyticsRouteSource = fs.readFileSync(analyticsRoutePath, "utf8");
const heartbeatRouteSource = fs.readFileSync(heartbeatRoutePath, "utf8");
const telemetryIngestionSource = fs.existsSync(telemetryIngestionPath) ? fs.readFileSync(telemetryIngestionPath, "utf8") : "";
const nextConfigSource = fs.readFileSync(nextConfigPath, "utf8");

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
    this.style = {};
    this.parentNode = null;
    this.shadowRoot = null;
    this.innerHTML = "";
    this.id = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "id") this.id = String(value);
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
    child.parentNode = null;
    return child;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  removeEventListener(type, handler) {
    if (this.listeners.get(type) === handler) this.listeners.delete(type);
  }

  attachShadow() {
    this.shadowRoot = new FakeShadowRoot(this);
    return this.shadowRoot;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 120, height: 32 };
  }
}

class FakeShadowRoot {
  constructor(host) {
    this.host = host;
    this._innerHTML = "";
    this.nodes = {};
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.nodes = {};
    if (value.includes("jb-credit-chip")) this.nodes[".jb-credit-chip"] = new FakeElement("a");
    if (value.includes("glow-bg")) this.nodes[".glow-bg"] = new FakeElement("div");
  }

  get innerHTML() {
    return this._innerHTML;
  }

  querySelector(selector) {
    return this.nodes[selector] || null;
  }
}

class FakeJBCreditHost extends FakeElement {
  constructor() {
    super("jb-credit");
  }
}

function makeContext(options = {}) {
  const body = new FakeElement("body");
  const documentElement = new FakeElement("html");
  const created = [];
  const fetchCalls = [];
  const beacons = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const sessionValues = options.sessionStorageValues || new Map();
  const counters = {
    mutationObserveCount: 0,
    mutationDisconnectCount: 0,
    mediaChangeListenerCount: 0,
  };
  const currentScript = new FakeElement("script");
  currentScript.src = options.scriptSrc || "https://jacobbarkin.com/embed/credit.js";
  for (const attr of options.scriptAttrs || []) currentScript.setAttribute(attr, "");
  for (const [attr, value] of Object.entries(options.scriptAttrValues || {})) currentScript.setAttribute(attr, value);

  const document = {
    currentScript: options.noCurrentScript ? null : currentScript,
    body,
    documentElement,
    referrer: options.referrer || "",
    title: options.title || "Fixture page",
    openCalled: false,
    writeValue: "",
    closeCalled: false,
    createElement(tagName) {
      const element = tagName === "jb-credit" ? new FakeJBCreditHost() : new FakeElement(tagName);
      created.push(element);
      return element;
    },
    querySelector(selector) {
      if (selector === "jb-credit") return options.existingCredit || null;
      return null;
    },
    contains(element) {
      return element === body || body.children.includes(element) || element === options.existingCredit;
    },
    addEventListener(type, handler) {
      documentListeners.set(type, handler);
      if (type === "DOMContentLoaded" && options.fireDomContentLoaded !== false) handler();
    },
    removeEventListener(type, handler) {
      if (documentListeners.get(type) === handler) documentListeners.delete(type);
    },
    open() {
      this.openCalled = true;
    },
    write(value) {
      this.writeValue += value;
    },
    close() {
      this.closeCalled = true;
    },
    visibilityState: options.visibilityState || "visible",
  };

  class HTMLElement extends FakeElement {
    constructor() {
      super("element");
    }
  }

  const customElements = {
    registry: new Map(),
    get(name) {
      return this.registry.get(name);
    },
    define(name, ctor) {
      this.registry.set(name, ctor);
    },
  };

  const context = {
    console,
    URL,
    Blob,
    AbortController,
    HTMLElement,
    customElements,
    document,
    navigator: {
      language: "en-US",
      languages: ["en-US"],
      sendBeacon(endpoint, blob) {
        beacons.push({ endpoint, blob });
        return options.sendBeaconResult !== undefined ? options.sendBeaconResult : true;
      },
    },
    location: new URL(options.pageUrl || "https://example.com/path?utm_campaign=spring"),
    sessionStorage: {
      values: sessionValues,
      get length() {
        return this.values.size;
      },
      key(index) {
        return Array.from(this.values.keys())[index] || null;
      },
      getItem(key) {
        return this.values.get(key) || null;
      },
      setItem(key, value) {
        this.values.set(key, String(value));
      },
      removeItem(key) {
        this.values.delete(key);
      },
    },
    performance: {
      now: () => 10,
    },
    getComputedStyle() {
      return { getPropertyValue: () => "" };
    },
    MutationObserver: class {
      observe() {
        counters.mutationObserveCount += 1;
      }
      disconnect() {
        counters.mutationDisconnectCount += 1;
      }
    },
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        this.callback([{ isIntersecting: true }]);
      }
      disconnect() {}
    },
    setTimeout(handler) {
      if (options.runTimersImmediately) handler();
      return 1;
    },
    clearTimeout() {},
    setInterval() {
      return 2;
    },
    clearInterval() {},
    requestIdleCallback(handler) {
      handler();
      return 3;
    },
    fetch(input, init) {
      fetchCalls.push({ input: String(input), init });
      if (options.fetchReject) return Promise.reject(options.fetchReject);
      const responseQueue = options.fetchResponses || null;
      const queued = responseQueue && responseQueue.length ? responseQueue.shift() : null;
      if (queued) {
        return Promise.resolve({
          ok: queued.ok !== undefined ? queued.ok : true,
          status: queued.status || 200,
          json: () => Promise.resolve(queued.json || { matched: false }),
        });
      }
      return Promise.resolve({
        ok: options.fetchOk !== undefined ? options.fetchOk : true,
        status: options.fetchStatus || 200,
        json: () => Promise.resolve(options.fetchJson || { matched: false }),
      });
    },
    addEventListener(type, handler) {
      windowListeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (windowListeners.get(type) === handler) windowListeners.delete(type);
    },
    matchMedia() {
      return {
        matches: false,
        addEventListener(type) {
          if (type === "change") counters.mediaChangeListenerCount += 1;
        },
        removeEventListener() {},
        addListener() {
          counters.mediaChangeListenerCount += 1;
        },
        removeListener() {},
      };
    },
  };

  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: scriptPath });

  return {
    context,
    currentScript,
    body,
    created,
    fetchCalls,
    beacons,
    documentListeners,
    windowListeners,
    counters,
    getCtor: () => customElements.get("jb-credit"),
  };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

async function collectBeaconEvents(env) {
  const batches = await Promise.all(
    env.beacons.map(async (item) => JSON.parse(await item.blob.text()))
  );
  return batches.flat();
}

async function collectBeaconBatches(env) {
  return Promise.all(
    env.beacons.map(async (item) => ({
      endpoint: item.endpoint,
      type: item.blob.type,
      body: JSON.parse(await item.blob.text()),
    }))
  );
}

async function testSafari12Syntax() {
  assert.equal(source.includes("?."), false, "public embed script must not use optional chaining");
  assert.equal(source.includes("??"), false, "public embed script must not use nullish coalescing");
}

async function testEmbedBuildPipelineExists() {
  assert.ok(fs.existsSync(authoredScriptPath), "authored embed source should live in src/embed/credit.js");
  assert.ok(fs.existsSync(buildEmbedPath), "embed build script should exist");
  assert.match(buildEmbedSource, /terser/, "embed build should use terser");
  assert.match(buildEmbedSource, /credit\.v\$\{version\.split/, "embed build should also write a versioned public script");
  assert.ok(fs.existsSync(path.join(repoRoot, "public/embed/credit.v3.js")), "versioned embed script should be generated");
  assert.notEqual(authoredSource.trim(), source.trim(), "public embed script should be generated/minified, not the authored source");
}

async function testSmallEmbedLogoIsUsed() {
  const logoPath = path.join(repoRoot, "public/embed/jb-logo.png");
  assert.ok(fs.existsSync(logoPath), "small embed logo should exist");
  assert.ok(fs.statSync(logoPath).size < 20000, "small embed logo should stay below 20 KB");
  assert.ok(source.includes("/embed/jb-logo.png"), "public embed script should reference the small embed logo");
  assert.equal(source.includes("/images/Updated%20logo.png"), false, "public embed script should not reference the large portfolio logo");
}

async function testNoRulesSkipsRuleFetchOnly() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"] });
  await flushMicrotasks();
  assert.equal(env.fetchCalls.length, 0, "data-no-rules should skip rule/custom-content fetches");

  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();
  env.context.JBCredit.analytics.flush(element);

  assert.ok(env.beacons.length >= 1, "analytics should remain enabled when data-no-rules is present");
}

async function testAutoInjectCopiesNoRules() {
  const env = makeContext({
    scriptAttrs: ["data-auto", "data-no-rules", "data-no-track"],
    scriptAttrValues: { "data-variant": "minimal", "data-site": "client-site" },
  });
  const injected = env.body.children.find((child) => child.tagName === "JB-CREDIT");
  assert.ok(injected, "data-auto should append a jb-credit element");
  assert.equal(injected.hasAttribute("data-no-rules"), true, "data-auto should copy data-no-rules");
  assert.equal(injected.hasAttribute("data-no-track"), true, "data-auto should copy data-no-track");
  assert.equal(injected.getAttribute("data-variant"), "minimal");
  assert.equal(injected.getAttribute("data-site"), "client-site");
}

async function testDataOnlyDoesNotRenderUiOrImpression() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"], runTimersImmediately: true });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.setAttribute("data-variant", "data-only");
  env.body.appendChild(element);
  element.connectedCallback();
  assert.ok(element.shadowRoot.innerHTML.includes("display: none"), "data-only should render invisible CSS only");

  env.context.JBCredit.analytics.flush(element);
  const events = await collectBeaconEvents(env);
  assert.equal(events.some((event) => event.event_name === "load"), false, "data-only should not emit load events");
  assert.equal(events.some((event) => event.event_name === "impression"), false, "data-only should not emit impression events");
  assert.equal(events.some((event) => event.event_name === "click"), false, "data-only should not emit click events");
  assert.ok(events.some((event) => event.event_name === "heartbeat"), "data-only should emit heartbeat events");
}

async function testAnalyticsPayloadAndDuplicateImpression() {
  const env = makeContext({
    scriptAttrs: ["data-no-rules"],
    pageUrl: "https://example.com/work?utm_source=newsletter&utm_campaign=launch",
  });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.setAttribute("data-site", "Client Site");
  element.setAttribute("data-page-group", "portfolio");
  element.connectedCallback();

  env.context.JBCredit.analytics.impression(element);
  env.context.JBCredit.analytics.flush(element);
  const events = await collectBeaconEvents(env);
  const impressions = events.filter((event) => event.event_name === "impression");
  const load = events.find((event) => event.event_name === "load");

  assert.equal(impressions.length, 1, "impressions should be deduplicated per element");
  assert.ok(load, "load event should be emitted");
  assert.equal(load.page_host, "example.com");
  assert.equal(load.page_path, "/work");
  assert.equal(load.utm_source, "newsletter");
  assert.equal(load.utm_campaign, "launch");
  assert.equal(load.site_key, "Client Site");
  assert.equal(load.installation_id, "client-site");
  assert.equal(load.page_group, "portfolio");
  assert.ok(load.session_id.startsWith("sess-"));
  assert.ok(load.page_view_id.startsWith("pv-"));
}

async function testRuleActionsAreExplicit() {
  const pageTakeover = makeContext({
    fetchJson: { matched: true, action_type: "page_takeover", html: "<html><body>takeover</body></html>" },
  });
  await flushMicrotasks();
  const takeoverFrame = pageTakeover.context.document.body.children.find((child) => child.tagName === "IFRAME");
  assert.ok(takeoverFrame, "page_takeover should mount an isolated iframe overlay");
  assert.equal(takeoverFrame.getAttribute("data-jb-rule-takeover"), "true");
  assert.ok(takeoverFrame.srcdoc.includes("takeover"));
  assert.equal(takeoverFrame.style.position, "fixed");
  assert.equal(takeoverFrame.style.inset, "0");
  assert.equal(pageTakeover.context.document.openCalled, false, "page_takeover should not use document.write after host app hydration");

  const inlineReplace = makeContext({
    fetchJson: { matched: true, action_type: "inline_replace", html: "<strong>inline</strong>" },
  });
  await flushMicrotasks();
  assert.equal(inlineReplace.context.document.openCalled, false, "inline_replace should not replace the whole document");
}

async function testBlockedBeaconFallsBackToFetch() {
  const env = makeContext({ sendBeaconResult: false });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();

  env.context.JBCredit.analytics.impression(element);
  env.context.JBCredit.analytics.flush(element);

  assert.ok(env.beacons.length >= 1, "analytics should try sendBeacon first");
  assert.equal(env.fetchCalls.length >= 2, true, "failed sendBeacon should retry analytics with fetch");
  assert.ok(
    env.fetchCalls.some((call) => call.input === "https://jacobbarkin.com/api/embed-analytics"),
    "fallback fetch should target analytics endpoint"
  );
  const analyticsFallback = env.fetchCalls.find((call) => call.input === "https://jacobbarkin.com/api/embed-analytics");
  assert.equal(
    analyticsFallback?.init?.headers?.["Content-Type"],
    "text/plain;charset=UTF-8",
    "fallback fetch should use a CORS-safelisted content type"
  );
}

async function testPublicPostsUseTextPlainJson() {
  const env = makeContext({ sendBeaconResult: true });
  await flushMicrotasks();
  const ruleFetch = env.fetchCalls.find((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate");
  assert.equal(ruleFetch?.init?.headers?.["Content-Type"], "text/plain;charset=UTF-8", "rule evaluation should avoid JSON preflights");

  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();
  env.context.JBCredit.analytics.flush(element);
  const beaconBatches = await collectBeaconBatches(env);
  assert.ok(
    beaconBatches.some((batch) => /^text\/plain/i.test(batch.type)),
    "sendBeacon payloads should use text/plain JSON"
  );
}

async function testRuleEvaluationUsesSessionCacheForNoMatch() {
  const sessionStorageValues = new Map();
  const first = makeContext({
    sessionStorageValues,
    fetchResponses: [{ ok: true, json: { matched: false } }],
  });
  await flushMicrotasks();
  assert.equal(
    first.fetchCalls.filter((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate").length,
    1,
    "first page view should evaluate rules"
  );

  const second = makeContext({ sessionStorageValues });
  await flushMicrotasks();
  assert.equal(
    second.fetchCalls.some((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate"),
    false,
    "recent no-match results should be reused without a network call"
  );
}

async function testRuleCacheKeysIncludeTargetingContext() {
  const sessionStorageValues = new Map();
  const first = makeContext({
    sessionStorageValues,
    pageUrl: "https://example.com/path?utm_campaign=spring",
    fetchResponses: [{ ok: true, json: { matched: false } }],
  });
  await flushMicrotasks();

  const second = makeContext({
    sessionStorageValues,
    pageUrl: "https://example.com/path?utm_campaign=summer",
    fetchResponses: [{ ok: true, json: { matched: false } }],
  });
  await flushMicrotasks();

  assert.equal(
    first.fetchCalls.filter((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate").length,
    1,
    "first context should evaluate rules"
  );
  assert.equal(
    second.fetchCalls.filter((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate").length,
    1,
    "different UTM context should not reuse a stale no-match rule cache"
  );
}

async function testRuleCacheCanBeBypassedWithUrlFlag() {
  const sessionStorageValues = new Map();
  const cached = makeContext({
    sessionStorageValues,
    pageUrl: "https://example.com/path?utm_campaign=spring",
    fetchResponses: [{ ok: true, json: { matched: false } }],
  });
  await flushMicrotasks();
  assert.equal(cached.fetchCalls.some((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate"), true);

  const bypassed = makeContext({
    sessionStorageValues,
    pageUrl: "https://example.com/path?utm_campaign=spring&jb-credit-rules=refresh",
    fetchResponses: [{ ok: true, json: { matched: false } }],
  });
  await flushMicrotasks();
  assert.equal(
    bypassed.fetchCalls.some((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate"),
    true,
    "jb-credit-rules=refresh should bypass cached rule results"
  );
  const ruleFetch = bypassed.fetchCalls.find((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate");
  const rulePayload = JSON.parse(ruleFetch.init.body);
  assert.equal(
    rulePayload.page_url,
    "https://example.com/path?utm_campaign=spring",
    "manual refresh params should not be sent to rule matching"
  );
}

async function testRuleCacheCanBeClearedAndRefetchedFromConsoleApi() {
  const sessionStorageValues = new Map();
  const env = makeContext({
    sessionStorageValues,
    fetchResponses: [
      { ok: true, json: { matched: false } },
      { ok: true, json: { matched: false } },
    ],
  });
  await flushMicrotasks();
  assert.equal(env.fetchCalls.filter((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate").length, 1);

  await env.context.JBCredit.refreshRules({ clearCache: true });
  await flushMicrotasks();

  assert.equal(
    env.fetchCalls.filter((call) => call.input === "https://jacobbarkin.com/api/embed-rules/evaluate").length,
    2,
    "JBCredit.refreshRules({ clearCache: true }) should refetch rules"
  );
}

async function testVisibilityHeartbeatIsThrottled() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"], runTimersImmediately: false });
  const Ctor = env.getCtor();
  const element = new Ctor();
  env.body.appendChild(element);
  element.connectedCallback();

  const visibilityHandler = env.documentListeners.get("visibilitychange");
  assert.ok(visibilityHandler, "heartbeat should bind a visibility handler");
  env.context.document.visibilityState = "visible";
  visibilityHandler();
  visibilityHandler();
  env.context.JBCredit.analytics.flush(element);

  const events = await collectBeaconEvents(env);
  assert.equal(
    events.filter((event) => event.event_name === "heartbeat").length,
    1,
    "visibility heartbeats should be throttled"
  );
}

async function testExplicitThemeSkipsThemeObservers() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"] });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.setAttribute("data-theme", "dark");
  element.connectedCallback();
  assert.equal(env.counters.mutationObserveCount, 0, "explicit themes should not create mutation observers");
  assert.equal(env.counters.mediaChangeListenerCount, 0, "explicit themes should not listen for color-scheme changes");
}

async function testLateInlineRuleAppliesToConnectedElement() {
  const env = makeContext({
    fetchResponses: [
      { ok: true, json: { matched: true, action_type: "inline_replace", html: "<strong>late inline</strong>", rule_id: "rule-1" } },
    ],
  });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();
  assert.notEqual(element.shadowRoot.innerHTML, "<strong>late inline</strong>", "fixture should connect before async rule result");
  await flushMicrotasks();
  assert.equal(element.shadowRoot.innerHTML, "<strong>late inline</strong>", "late inline replacement should apply");
}

async function testLateCreditOverrideAppliesToConnectedElement() {
  const env = makeContext({
    fetchResponses: [
      {
        ok: true,
        json: {
          matched: true,
          action_type: "credit_variant_override",
          credit_override: { variant: "text", theme: "dark", size: "small", align: "left" },
          rule_id: "rule-2",
        },
      },
    ],
  });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();
  await flushMicrotasks();
  assert.equal(element.getAttribute("data-variant"), "text");
  assert.equal(element.getAttribute("data-theme"), "dark");
  assert.equal(element.getAttribute("data-size"), "small");
  assert.equal(element.getAttribute("data-align"), "left");
}

async function testNonOkRuleEvaluationUsesIframeLegacyFallback() {
  const env = makeContext({
    fetchResponses: [
      { ok: false, status: 503, json: { error: "unavailable" } },
      { ok: true, json: { match: true, content_html: "<html><body>legacy</body></html>" } },
    ],
  });
  await flushMicrotasks();
  const takeoverFrame = env.context.document.body.children.find((child) => child.tagName === "IFRAME");
  assert.ok(takeoverFrame, "legacy fallback should mount an iframe takeover");
  assert.ok(takeoverFrame.srcdoc.includes("legacy"));
  assert.equal(env.context.document.openCalled, false, "legacy fallback should not use document.open");
  assert.equal(env.context.document.closeCalled, false, "legacy fallback should not use document.close");
}

async function testHeartbeatTimingSeparatesVisibleAndDataOnlyEmbeds() {
  const visibleEnv = makeContext({ scriptAttrs: ["data-no-rules"], runTimersImmediately: false });
  const VisibleCtor = visibleEnv.getCtor();
  const visible = new VisibleCtor();
  visibleEnv.body.appendChild(visible);
  visible.connectedCallback();
  visibleEnv.context.JBCredit.analytics.flush(visible);
  let visibleEvents = await collectBeaconEvents(visibleEnv);
  assert.equal(visibleEvents.some((event) => event.event_name === "heartbeat"), false, "visible embed should not emit immediate heartbeat");

  const dataOnlyEnv = makeContext({ scriptAttrs: ["data-no-rules"], runTimersImmediately: true });
  const DataOnlyCtor = dataOnlyEnv.getCtor();
  const dataOnly = new DataOnlyCtor();
  dataOnly.setAttribute("data-variant", "data-only");
  dataOnlyEnv.body.appendChild(dataOnly);
  dataOnly.connectedCallback();
  dataOnlyEnv.context.JBCredit.analytics.flush(dataOnly);
  const dataOnlyEvents = await collectBeaconEvents(dataOnlyEnv);
  assert.ok(dataOnlyEvents.some((event) => event.event_name === "heartbeat"), "data-only should keep early heartbeat");
}

async function testFixedBottomOffsetIsSupported() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"] });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.setAttribute("data-position", "fixed");
  element.setAttribute("data-bottom-offset", "16px");
  element.connectedCallback();
  assert.ok(element.shadowRoot.innerHTML.includes("bottom: var(--jb-credit-bottom-offset, 16px)"));
}

async function testEffectsCanBeDisabled() {
  const env = makeContext({ scriptAttrs: ["data-no-rules"] });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.setAttribute("data-effects", "none");
  element.connectedCallback();
  assert.equal(element.shadowRoot.innerHTML.includes('<div class="glow-bg">'), false, "data-effects=none should omit glow markup");
  assert.equal(element.shadowRoot.innerHTML.includes("animated-border"), true, "base stylesheet can still include effect classes");
}

async function testPublicRuntimeEndpointsAreNotGloballyProtected() {
  assert.match(
    middlewareSource,
    /pathname === "\/api\/embed-rules\/evaluate"/,
    "rule evaluation endpoint must bypass global Clerk protection"
  );
  assert.match(
    middlewareSource,
    /pathname === "\/api\/embed-analytics" && \(req\.method === "POST" \|\| req\.method === "OPTIONS"\)/,
    "analytics ingestion must bypass global Clerk protection"
  );
  assert.match(
    middlewareSource,
    /pathname === "\/api\/embed-heartbeat" && \(req\.method === "POST" \|\| req\.method === "OPTIONS"\)/,
    "heartbeat ingestion must bypass global Clerk protection"
  );
  assert.match(
    middlewareSource,
    /url\.searchParams\.get\("list"\) !== "true"/,
    "legacy public custom-content lookup must bypass global Clerk protection without exposing admin listing"
  );
}

async function testRuleTargetsAreNormalized() {
  assert.match(
    rulesSource,
    /function normalizeHostValue/,
    "rule evaluation should normalize saved host targets before matching"
  );
  assert.match(
    rulesSource,
    /normalizeUrlValue\(conditions\.exact_url\)/,
    "rule evaluation should normalize exact URL targets before matching"
  );
  assert.match(
    rulesSource,
    /normalizePathPrefixValue/,
    "rule evaluation should normalize path-prefix targets before matching"
  );
  assert.match(
    rulesManagerSource,
    /parseLineList\(target\.domain\)\.map\(normalizeHostTarget\)/,
    "rule composer should serialize domain targets as canonical hostnames"
  );
  assert.match(
    rulesManagerSource,
    /parseLineList\(target\.exactUrl\)\.map\(normalizeUrlTarget\)/,
    "rule composer should serialize exact URLs canonically"
  );
  assert.match(
    rulesSource,
    /conditions\.require_timezone_offset === true/,
    "timezone offsets should only affect matching when explicitly opted in through raw JSON"
  );
  assert.doesNotMatch(
    rulesManagerSource,
    /conditions\.timezone_offsets = parseNumberLineList\(draft\.timezoneOffsets\)/,
    "friendly rule composer should not serialize timezone offsets by default"
  );
}

async function testCanonicalTelemetryWritesOnly() {
  assert.doesNotMatch(analyticsRouteSource, /INSERT INTO embed_analytics/, "analytics POST should not write legacy embed_analytics rows");
  assert.doesNotMatch(heartbeatRouteSource, /INSERT INTO embed_heartbeat/, "heartbeat POST should not write legacy embed_heartbeat rows");
  assert.doesNotMatch(heartbeatRouteSource, /INSERT INTO embed_sites/, "heartbeat POST should not write legacy embed_sites rows");
  assert.doesNotMatch(analyticsRouteSource, /incrementDailyMetric/, "analytics POST should not increment daily metrics directly");
  assert.doesNotMatch(heartbeatRouteSource, /incrementDailyMetric/, "heartbeat POST should not increment daily metrics directly");
  assert.match(analyticsRouteSource, /FROM embed_events/, "analytics admin GET should read canonical embed_events");
  assert.match(heartbeatRouteSource, /FROM embed_installations/, "heartbeat admin GET should read canonical installations");
  assert.match(analyticsRouteSource, /parsePublicJsonBody/, "analytics POST should accept text/plain JSON");
  assert.match(heartbeatRouteSource, /parsePublicJsonBody/, "heartbeat POST should accept text/plain JSON");
  assert.match(analyticsRouteSource, /ingestTelemetryPayloads/, "analytics POST should use shared ingestion");
  assert.match(heartbeatRouteSource, /ingestTelemetryPayloads/, "heartbeat POST should use shared ingestion");
  assert.match(telemetryIngestionSource, /\.batch\(/, "shared ingestion should use D1 batch when available");
}

async function testRuleEvaluationUsesFilteredRulesAndStableRollout() {
  assert.match(rulesSource, /listEvaluableRules/, "rule evaluation should use a filtered rule query");
  assert.match(rulesSource, /stableRolloutBucket/, "rule rollout should use a stable bucket helper");
  assert.doesNotMatch(rulesSource, /context\.installation_id\}\|\$\{context\.url\}\|\$\{rule\.id\}/, "rollout should not include page URL");
  assert.doesNotMatch(rulesSource, /status IN \('active', 'scheduled', 'preview'\)/, "public rule evaluation should not include preview rules");
  assert.match(rulesSource, /status IN \('active', 'scheduled'\)/, "public rule evaluation should include only live evaluable statuses");
}

async function testEmbedAssetCacheHeadersExist() {
  assert.match(nextConfigSource, /source: "\/embed\/credit\.js"/, "embed script should have explicit cache headers");
  assert.match(nextConfigSource, /stale-while-revalidate=86400/, "embed script should use stale-while-revalidate");
  assert.match(nextConfigSource, /source: "\/embed\/credit\.v3\.js"/, "versioned embed script should have explicit cache headers");
  assert.match(nextConfigSource, /max-age=31536000, immutable/, "versioned embed script should be immutable");
  assert.match(nextConfigSource, /source: "\/embed\/jb-logo\.png"/, "embed logo should have explicit cache headers");
}

async function testRemovedDeadMetricHelpers() {
  assert.doesNotMatch(
    fs.readFileSync(path.join(repoRoot, "src/lib/embed/utils.ts"), "utf8"),
    /incrementDailyMetric|createMetricIncrement|DailyMetricIncrement/,
    "unused direct daily metric helpers should be removed"
  );
}

async function testInstructionsTellAgentsToUseDefaults() {
  const instructionsSource = fs.readFileSync(path.join(repoRoot, "public/embed/INSTRUCTIONS.md"), "utf8");
  assert.match(instructionsSource, /Agent default policy/, "instructions should include an agent default policy");
  assert.match(
    instructionsSource,
    /Do not set `data-no-track`, `data-no-rules`, or `data-effects="none"` unless/,
    "instructions should tell agents not to disable defaults unless explicitly requested"
  );
  assert.match(
    instructionsSource,
    /recommended install URL for existing and new sites/,
    "instructions should keep /embed/credit.js as the install URL"
  );
  assert.doesNotMatch(
    fs.readFileSync(path.join(repoRoot, "docs/features/EMBED.md"), "utf8"),
    /New installs may use `\/embed\/credit\.v3\.js`/,
    "feature docs should not recommend the versioned URL for new installs"
  );
}

async function run() {
  const tests = [
    testSafari12Syntax,
    testEmbedBuildPipelineExists,
    testSmallEmbedLogoIsUsed,
    testNoRulesSkipsRuleFetchOnly,
    testAutoInjectCopiesNoRules,
    testDataOnlyDoesNotRenderUiOrImpression,
    testAnalyticsPayloadAndDuplicateImpression,
    testRuleActionsAreExplicit,
    testBlockedBeaconFallsBackToFetch,
    testPublicPostsUseTextPlainJson,
    testRuleEvaluationUsesSessionCacheForNoMatch,
    testRuleCacheKeysIncludeTargetingContext,
    testRuleCacheCanBeBypassedWithUrlFlag,
    testRuleCacheCanBeClearedAndRefetchedFromConsoleApi,
    testVisibilityHeartbeatIsThrottled,
    testExplicitThemeSkipsThemeObservers,
    testLateInlineRuleAppliesToConnectedElement,
    testLateCreditOverrideAppliesToConnectedElement,
    testNonOkRuleEvaluationUsesIframeLegacyFallback,
    testHeartbeatTimingSeparatesVisibleAndDataOnlyEmbeds,
    testFixedBottomOffsetIsSupported,
    testEffectsCanBeDisabled,
    testPublicRuntimeEndpointsAreNotGloballyProtected,
    testRuleTargetsAreNormalized,
    testCanonicalTelemetryWritesOnly,
    testRuleEvaluationUsesFilteredRulesAndStableRollout,
    testEmbedAssetCacheHeadersExist,
    testRemovedDeadMetricHelpers,
    testInstructionsTellAgentsToUseDefaults,
  ];

  for (const test of tests) {
    await test();
    console.log(`ok - ${test.name}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
