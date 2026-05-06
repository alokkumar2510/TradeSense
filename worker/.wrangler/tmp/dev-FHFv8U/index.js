var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/services/fmp.ts
var BASE = "https://financialmodelingprep.com/api";
async function fetchQuote(symbol, env2) {
  const res = await fetch(
    `${BASE}/v3/quote/${encodeURIComponent(symbol)}?apikey=${env2.FMP_API_KEY}`
  );
  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP error: ${res.status}`);
  const data = await res.json();
  if (!data || data.length === 0) throw new Error("SYMBOL_NOT_FOUND");
  return data[0];
}
__name(fetchQuote, "fetchQuote");
async function fetchHistory(symbol, env2, days = 180) {
  const to = /* @__PURE__ */ new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  const res = await fetch(
    `${BASE}/v3/historical-price-full/${encodeURIComponent(symbol)}?from=${from.toISOString().split("T")[0]}&to=${to.toISOString().split("T")[0]}&apikey=${env2.FMP_API_KEY}`
  );
  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP history error: ${res.status}`);
  const data = await res.json();
  return (data.historical ?? []).reverse();
}
__name(fetchHistory, "fetchHistory");
async function fetchNews(symbol, env2, limit = 10) {
  const res = await fetch(
    `${BASE}/v3/stock_news?tickers=${encodeURIComponent(symbol)}&limit=${limit}&apikey=${env2.FMP_API_KEY}`
  );
  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP news error: ${res.status}`);
  return res.json();
}
__name(fetchNews, "fetchNews");
async function searchSymbols(query, env2) {
  const res = await fetch(
    `${BASE}/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${env2.FMP_API_KEY}`
  );
  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP search error: ${res.status}`);
  return res.json();
}
__name(searchSymbols, "searchSymbols");

// src/services/alphaVantage.ts
var BASE2 = "https://www.alphavantage.co/query";
async function fetchRSI(symbol, env2) {
  const url = `${BASE2}?function=RSI&symbol=${encodeURIComponent(symbol)}&interval=daily&time_period=14&series_type=close&apikey=${env2.ALPHA_VANTAGE_KEY}`;
  const res = await fetch(url);
  if (res.status === 429) throw new Error("AV_RATE_LIMITED");
  if (!res.ok) throw new Error(`AV RSI error: ${res.status}`);
  const json = await res.json();
  const dataKey = Object.keys(json).find((k) => k.startsWith("Technical Analysis"));
  if (!dataKey) {
    if (json["Note"] || json["Information"]) throw new Error("AV_RATE_LIMITED");
    throw new Error("AV_RSI_PARSE_ERROR");
  }
  const timeSeries = json[dataKey];
  const latestDate = Object.keys(timeSeries)[0];
  return {
    value: parseFloat(timeSeries[latestDate]["RSI"]),
    timestamp: latestDate
  };
}
__name(fetchRSI, "fetchRSI");
async function fetchMACD(symbol, env2) {
  const url = `${BASE2}?function=MACD&symbol=${encodeURIComponent(symbol)}&interval=daily&series_type=close&apikey=${env2.ALPHA_VANTAGE_KEY}`;
  const res = await fetch(url);
  if (res.status === 429) throw new Error("AV_RATE_LIMITED");
  if (!res.ok) throw new Error(`AV MACD error: ${res.status}`);
  const json = await res.json();
  const dataKey = Object.keys(json).find((k) => k.startsWith("Technical Analysis"));
  if (!dataKey) {
    if (json["Note"] || json["Information"]) throw new Error("AV_RATE_LIMITED");
    throw new Error("AV_MACD_PARSE_ERROR");
  }
  const timeSeries = json[dataKey];
  const latestDate = Object.keys(timeSeries)[0];
  const latest = timeSeries[latestDate];
  return {
    macd: parseFloat(latest["MACD"]),
    signal: parseFloat(latest["MACD_Signal"]),
    histogram: parseFloat(latest["MACD_Hist"]),
    timestamp: latestDate
  };
}
__name(fetchMACD, "fetchMACD");

// src/services/signalEngine.ts
function generateSignal(rsi, macd) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!rsi || !macd) {
    return {
      strength: "INSUFFICIENT_DATA",
      score: 0,
      explanation: "Unable to compute signal \u2014 indicator data unavailable. This may be due to API rate limits. Please try again in a moment.",
      rsiSummary: "RSI data unavailable",
      macdSummary: "MACD data unavailable",
      generatedAt: now
    };
  }
  const rsiVal = rsi.value;
  const macdVal = macd.macd;
  const hist = macd.histogram;
  let rsiScore = 0;
  let macdScore = 0;
  if (rsiVal < 20) rsiScore = 50;
  else if (rsiVal < 30) rsiScore = 35;
  else if (rsiVal < 40) rsiScore = 15;
  else if (rsiVal < 60) rsiScore = 0;
  else if (rsiVal < 70) rsiScore = -15;
  else if (rsiVal < 80) rsiScore = -35;
  else rsiScore = -50;
  if (hist > 0 && macdVal > 0) macdScore = 50;
  else if (hist > 0 && macdVal <= 0) macdScore = 25;
  else if (hist <= 0 && macdVal > 0) macdScore = -25;
  else macdScore = -50;
  const score = rsiScore + macdScore;
  let strength;
  if (score >= 70) strength = "STRONG_BUY";
  else if (score >= 30) strength = "BUY";
  else if (score >= -30) strength = "HOLD";
  else if (score >= -70) strength = "SELL";
  else strength = "STRONG_SELL";
  const rsiSummary = formatRSI(rsiVal);
  const macdSummary = formatMACD(macdVal, hist);
  const explanation = buildExplanation(strength, rsiSummary, macdSummary);
  return { strength, score, explanation, rsiSummary, macdSummary, generatedAt: now };
}
__name(generateSignal, "generateSignal");
function formatRSI(v) {
  if (v < 30) return `RSI at ${v.toFixed(1)} \u2014 stock is oversold, potential buying opportunity`;
  if (v > 70) return `RSI at ${v.toFixed(1)} \u2014 stock is overbought, potential selling pressure`;
  return `RSI at ${v.toFixed(1)} \u2014 in neutral zone, no extreme pressure`;
}
__name(formatRSI, "formatRSI");
function formatMACD(macd, hist) {
  const dir3 = hist > 0 ? "positive (bullish momentum)" : "negative (bearish momentum)";
  return `MACD histogram is ${dir3} at ${hist.toFixed(4)}, MACD line at ${macd.toFixed(4)}`;
}
__name(formatMACD, "formatMACD");
function buildExplanation(strength, rsiSummary, macdSummary) {
  const parts = [];
  switch (strength) {
    case "STRONG_BUY":
      parts.push("\u{1F7E2} STRONG BUY signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Both indicators align bullishly. Consider this a high-conviction entry opportunity, but always confirm with your own research and risk tolerance.");
      break;
    case "BUY":
      parts.push("\u{1F7E2} BUY signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Indicators lean bullish but not extreme. Watch for confirmation before entering a full position.");
      break;
    case "HOLD":
      parts.push("\u{1F7E1} HOLD \u2014 neutral signal.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("No strong directional bias. Maintain existing positions and wait for a clearer setup.");
      break;
    case "SELL":
      parts.push("\u{1F534} SELL signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Indicators lean bearish. Consider reducing exposure or tightening stop-losses.");
      break;
    case "STRONG_SELL":
      parts.push("\u{1F534} STRONG SELL signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Both indicators align bearishly. High-conviction exit or short signal. Proceed with caution and proper risk management.");
      break;
    default:
      parts.push("\u26A0\uFE0F Insufficient data to generate a signal.");
  }
  parts.push("\n\u26A0\uFE0F This is algorithmic analysis only. Not financial advice. Always do your own due diligence.");
  return parts.join(" ");
}
__name(buildExplanation, "buildExplanation");

// src/lib/cache.ts
async function getOrFetch(env2, key, ttlSeconds, fetchFn) {
  const cached = await env2.CACHE.get(key, "json");
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }
  const fresh = await fetchFn();
  await env2.CACHE.put(key, JSON.stringify(fresh), {
    expirationTtl: ttlSeconds
  });
  return { data: fresh, fromCache: false };
}
__name(getOrFetch, "getOrFetch");
var TTL = {
  QUOTE: 60,
  // 1 minute
  HISTORY: 300,
  // 5 minutes
  INDICATORS: 300,
  // 5 minutes
  SIGNAL: 300,
  // 5 minutes
  NEWS: 600,
  // 10 minutes
  SEARCH: 120
  // 2 minutes
};

// src/lib/response.ts
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(message, code, status = 500) {
  return jsonResponse({ ok: false, error: message, code }, status);
}
__name(errorResponse, "errorResponse");
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(handleOptions, "handleOptions");

// src/routes/stock.ts
async function handleQuote(symbol, env2) {
  try {
    const { data: quote } = await getOrFetch(
      env2,
      `quote:${symbol}`,
      TTL.QUOTE,
      () => fetchQuote(symbol, env2)
    );
    return jsonResponse({ ok: true, data: quote });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "SYMBOL_NOT_FOUND") return errorResponse("Symbol not found", "NOT_FOUND", 404);
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited, cached data unavailable", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch quote", "SERVER_ERROR", 500);
  }
}
__name(handleQuote, "handleQuote");
async function handleHistory(symbol, env2) {
  try {
    const { data: bars } = await getOrFetch(
      env2,
      `history:${symbol}`,
      TTL.HISTORY,
      () => fetchHistory(symbol, env2, 180)
    );
    return jsonResponse({ ok: true, data: bars });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch history", "SERVER_ERROR", 500);
  }
}
__name(handleHistory, "handleHistory");
async function handleSignal(symbol, env2) {
  try {
    const [rsiResult, macdResult] = await Promise.allSettled([
      getOrFetch(env2, `rsi:${symbol}`, TTL.INDICATORS, () => fetchRSI(symbol, env2)),
      getOrFetch(env2, `macd:${symbol}`, TTL.INDICATORS, () => fetchMACD(symbol, env2))
    ]);
    const rsi = rsiResult.status === "fulfilled" ? rsiResult.value.data : null;
    const macd = macdResult.status === "fulfilled" ? macdResult.value.data : null;
    const staleness = rsiResult.status === "rejected" || macdResult.status === "rejected" ? "stale" : "fresh";
    const signal = generateSignal(rsi, macd);
    return jsonResponse({ ok: true, data: { signal, rsi, macd, staleness } });
  } catch {
    return errorResponse("Failed to compute signal", "SERVER_ERROR", 500);
  }
}
__name(handleSignal, "handleSignal");
async function handleSearch(query, env2) {
  try {
    const { data } = await getOrFetch(
      env2,
      `search:${query.toLowerCase()}`,
      TTL.SEARCH,
      () => searchSymbols(query, env2)
    );
    return jsonResponse({ ok: true, data });
  } catch {
    return errorResponse("Search failed", "SERVER_ERROR", 500);
  }
}
__name(handleSearch, "handleSearch");

// src/services/sentiment.ts
var POSITIVE_WORDS = [
  "surge",
  "rally",
  "gain",
  "rise",
  "profit",
  "record",
  "growth",
  "beat",
  "strong",
  "bullish",
  "upgrade",
  "buy",
  "outperform",
  "dividend",
  "acquisition",
  "partnership",
  "expansion",
  "revenue",
  "positive",
  "upside",
  "recovery",
  "boost"
];
var NEGATIVE_WORDS = [
  "fall",
  "drop",
  "loss",
  "decline",
  "miss",
  "weak",
  "bearish",
  "downgrade",
  "sell",
  "underperform",
  "debt",
  "layoff",
  "fraud",
  "investigation",
  "lawsuit",
  "fine",
  "risk",
  "concern",
  "warning",
  "negative",
  "downside",
  "crash",
  "bankruptcy",
  "default"
];
function classifySentiment(title2, body = "") {
  const text = `${title2} ${body}`.toLowerCase();
  let score = 0;
  for (const w of POSITIVE_WORDS) if (text.includes(w)) score++;
  for (const w of NEGATIVE_WORDS) if (text.includes(w)) score--;
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}
__name(classifySentiment, "classifySentiment");

// src/routes/news.ts
async function handleNews(symbol, env2) {
  try {
    const { data: rawNews } = await getOrFetch(
      env2,
      `news:${symbol}`,
      TTL.NEWS,
      () => fetchNews(symbol, env2, 10)
    );
    const news = rawNews.map((item, i) => ({
      id: `${symbol}-${i}`,
      title: item.title,
      url: item.url,
      source: item.site,
      publishedAt: item.publishedDate,
      image: item.image,
      sentiment: classifySentiment(item.title, item.text)
    }));
    return jsonResponse({ ok: true, data: news });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch news", "SERVER_ERROR", 500);
  }
}
__name(handleNews, "handleNews");

// src/index.ts
var worker = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    if (method === "OPTIONS") return handleOptions();
    if (path === "/health") return jsonResponse({ ok: true, version: "1.0.0" });
    if (path === "/api/search" && method === "GET") {
      const q = url.searchParams.get("q")?.trim();
      if (!q || q.length < 1) return errorResponse("Query param 'q' required", "SERVER_ERROR", 400);
      return handleSearch(q, env2);
    }
    const symbolMatch = path.match(/^\/api\/(quote|history|signal|news)\/(.+)$/);
    if (symbolMatch && method === "GET") {
      const [, route, rawSymbol] = symbolMatch;
      const symbol = decodeURIComponent(rawSymbol).toUpperCase().trim();
      if (!symbol || symbol.length > 20) {
        return errorResponse("Invalid symbol", "NOT_FOUND", 400);
      }
      switch (route) {
        case "quote":
          return handleQuote(symbol, env2);
        case "history":
          return handleHistory(symbol, env2);
        case "signal":
          return handleSignal(symbol, env2);
        case "news":
          return handleNews(symbol, env2);
      }
    }
    return errorResponse("Route not found", "NOT_FOUND", 404);
  }
};
var src_default = worker;

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-NcO7ej/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-NcO7ej/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker2) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker2;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker2.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker2.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker2,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker2.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker2.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
