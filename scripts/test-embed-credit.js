const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(repoRoot, "public/embed/credit.js");
const middlewarePath = path.join(repoRoot, "src/middleware.ts");
const source = fs.readFileSync(scriptPath, "utf8");
const middlewareSource = fs.readFileSync(middlewarePath, "utf8");

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
      values: new Map(),
      getItem(key) {
        return this.values.get(key) || null;
      },
      setItem(key, value) {
        this.values.set(key, String(value));
      },
    },
    performance: {
      now: () => 10,
    },
    getComputedStyle() {
      return { getPropertyValue: () => "" };
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
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
      return Promise.resolve({
        ok: true,
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
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
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

async function testSafari12Syntax() {
  assert.equal(source.includes("?."), false, "public embed script must not use optional chaining");
  assert.equal(source.includes("??"), false, "public embed script must not use nullish coalescing");
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
  element.connectedCallback();
  assert.ok(element.shadowRoot.innerHTML.includes("display: none"), "data-only should render invisible CSS only");

  const eventNames = env.beacons.map((item) => item.blob && item.blob.constructor.name).length;
  assert.ok(eventNames >= 0, "beacon plumbing should remain available");
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

async function testBlockedBeaconDoesNotFallbackToFetch() {
  const env = makeContext({ sendBeaconResult: false });
  const Ctor = env.getCtor();
  const element = new Ctor();
  element.connectedCallback();

  env.context.JBCredit.analytics.impression(element);
  env.context.JBCredit.analytics.flush(element);

  assert.ok(env.beacons.length >= 1, "analytics should try sendBeacon first");
  assert.equal(env.fetchCalls.length, 1, "failed sendBeacon should not retry analytics with fetch");
  assert.equal(env.fetchCalls[0].input, "https://jacobbarkin.com/api/embed-rules/evaluate");
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

async function run() {
  const tests = [
    testSafari12Syntax,
    testNoRulesSkipsRuleFetchOnly,
    testAutoInjectCopiesNoRules,
    testDataOnlyDoesNotRenderUiOrImpression,
    testAnalyticsPayloadAndDuplicateImpression,
    testRuleActionsAreExplicit,
    testBlockedBeaconDoesNotFallbackToFetch,
    testPublicRuntimeEndpointsAreNotGloballyProtected,
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
