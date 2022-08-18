import require$$0 from "/-/get-stdin@v7.0.0-gLSRomacsJhSecq2yRpn/dist=es2019,mode=imports/optimized/get-stdin.js";
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
  globalContext = window;
} else if (typeof self !== "undefined") {
  globalContext = self;
} else {
  globalContext = {};
}
if (typeof globalContext.setTimeout === "function") {
  cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
  cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e2) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e2) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
function nextTick(fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function() {
  this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser = true;
var argv = [];
var version = "";
var versions = {};
var release = {};
var config = {};
function noop() {
}
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error("process.binding is not supported");
}
function cwd() {
  return "/";
}
function chdir(dir) {
  throw new Error("process.chdir is not supported");
}
function umask() {
  return 0;
}
var performance = globalContext.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
  return new Date().getTime();
};
function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds, nanoseconds];
}
var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1e3;
}
var process = {
  nextTick,
  title,
  browser,
  env: {NODE_ENV: "production"},
  argv,
  version,
  versions,
  on,
  addListener,
  once,
  off,
  removeListener,
  removeAllListeners,
  emit,
  binding,
  cwd,
  chdir,
  umask,
  hrtime,
  platform,
  release,
  config,
  uptime
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var pandocFilter = createCommonjsModule(function(module, exports) {
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  const get_stdin_1 = __importDefault(require$$0);
  async function toJSONFilter2(action) {
    const json = await get_stdin_1.default();
    var data = JSON.parse(json);
    var format = process.argv.length > 2 ? process.argv[2] : "";
    filter2(data, action, format).then((output) => process.stdout.write(JSON.stringify(output)));
  }
  exports.toJSONFilter = toJSONFilter2;
  function isElt(x) {
    return typeof x === "object" && x && "t" in x || false;
  }
  function isEltArray(x) {
    return x.every(isElt);
  }
  async function walk2(x, action, format, meta) {
    if (typeof action === "function")
      action = {single: action};
    if (Array.isArray(x)) {
      if (action.array && isEltArray(x)) {
        x = await action.array(x, format, meta);
        if (!Array.isArray(x))
          throw "impossible (just for ts)";
      }
      var array = [];
      for (const item of x) {
        if (isElt(item) && action.single) {
          var res = await action.single(item, format, meta) || item;
          if (Array.isArray(res)) {
            for (const z of res) {
              array.push(await walk2(z, action, format, meta));
            }
          } else {
            array.push(await walk2(res, action, format, meta));
          }
        } else {
          array.push(await walk2(item, action, format, meta));
        }
      }
      return array;
    } else if (typeof x === "object" && x !== null) {
      var obj = {};
      for (const k of Object.keys(x)) {
        obj[k] = await walk2(x[k], action, format, meta);
      }
      return obj;
    }
    return x;
  }
  exports.walk = walk2;
  function walkSync2(x, action, format, meta) {
    if (Array.isArray(x)) {
      var array = [];
      for (const item of x) {
        if (isElt(item)) {
          var res = action(item, format, meta) || item;
          if (Array.isArray(res)) {
            for (const z of res) {
              array.push(walkSync2(z, action, format, meta));
            }
          } else {
            array.push(walkSync2(res, action, format, meta));
          }
        } else {
          array.push(walkSync2(item, action, format, meta));
        }
      }
      return array;
    } else if (typeof x === "object" && x !== null) {
      var obj = {};
      for (const k of Object.keys(x)) {
        obj[k] = walkSync2(x[k], action, format, meta);
      }
      return obj;
    }
    return x;
  }
  exports.walkSync = walkSync2;
  function stringify2(x) {
    if (!Array.isArray(x) && x.t === "MetaString")
      return x.c;
    var result = [];
    var go = function(e) {
      if (e.t === "Str")
        result.push(e.c);
      else if (e.t === "Code")
        result.push(e.c[1]);
      else if (e.t === "Math")
        result.push(e.c[1]);
      else if (e.t === "LineBreak")
        result.push(" ");
      else if (e.t === "Space")
        result.push(" ");
      else if (e.t === "SoftBreak")
        result.push(" ");
      else if (e.t === "Para")
        result.push("\n");
    };
    walkSync2(x, go, "", {});
    return result.join("");
  }
  exports.stringify = stringify2;
  function attributes2(attrs) {
    attrs = attrs || {};
    var ident = attrs.id || "";
    var classes = attrs.classes || [];
    var keyvals = [];
    Object.keys(attrs).forEach(function(k) {
      if (k !== "classes" && k !== "id")
        keyvals.push([k, attrs[k]]);
    });
    return [ident, classes, keyvals];
  }
  exports.attributes = attributes2;
  function elt(eltType, numargs) {
    return function(...args) {
      var len = args.length;
      if (len !== numargs)
        throw eltType + " expects " + numargs + " arguments, but given " + len;
      return {t: eltType, c: len === 1 ? args[0] : args};
    };
  }
  async function filter2(data, action, format) {
    return await walk2(data, action, format, data.meta || data[0].unMeta);
  }
  exports.filter = filter2;
  function rawToMeta2(e) {
    if (Array.isArray(e)) {
      return {t: "MetaList", c: e.map((x) => rawToMeta2(x))};
    }
    if (typeof e === "string" || typeof e === "number")
      return {t: "MetaString", c: String(e)};
    if (typeof e === "object") {
      const c = fromEntries(Object.entries(e).map(([k, v]) => [k, rawToMeta2(v)]));
      return {t: "MetaMap", c};
    }
    if (typeof e === "boolean")
      return {t: "MetaBool", c: e};
    throw Error(typeof e);
  }
  exports.rawToMeta = rawToMeta2;
  function metaToRaw2(m) {
    if (m.t === "MetaMap") {
      return fromEntries(Object.entries(m.c).map(([k, v]) => [k, metaToRaw2(v)]));
    } else if (m.t === "MetaList") {
      return m.c.map(metaToRaw2);
    } else if (m.t === "MetaBool" || m.t === "MetaString") {
      return m.c;
    } else if (m.t === "MetaInlines" || m.t === "MetaBlocks") {
      return stringify2(m.c);
    }
    throw Error(`Unknown meta type ${m.t}`);
  }
  exports.metaToRaw = metaToRaw2;
  function metaMapToRaw2(c) {
    return metaToRaw2({t: "MetaMap", c});
  }
  exports.metaMapToRaw = metaMapToRaw2;
  function fromEntries(iterable) {
    return [...iterable].reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
  }
  exports.Plain = elt("Plain", 1);
  exports.Para = elt("Para", 1);
  exports.CodeBlock = elt("CodeBlock", 2);
  exports.RawBlock = elt("RawBlock", 2);
  exports.BlockQuote = elt("BlockQuote", 1);
  exports.OrderedList = elt("OrderedList", 2);
  exports.BulletList = elt("BulletList", 1);
  exports.DefinitionList = elt("DefinitionList", 1);
  exports.Header = elt("Header", 3);
  exports.HorizontalRule = elt("HorizontalRule", 0);
  exports.Table = elt("Table", 5);
  exports.Div = elt("Div", 2);
  exports.Null = elt("Null", 0);
  exports.Str = elt("Str", 1);
  exports.Emph = elt("Emph", 1);
  exports.Strong = elt("Strong", 1);
  exports.Strikeout = elt("Strikeout", 1);
  exports.Superscript = elt("Superscript", 1);
  exports.Subscript = elt("Subscript", 1);
  exports.SmallCaps = elt("SmallCaps", 1);
  exports.Quoted = elt("Quoted", 2);
  exports.Cite = elt("Cite", 2);
  exports.Code = elt("Code", 2);
  exports.Space = elt("Space", 0);
  exports.LineBreak = elt("LineBreak", 0);
  exports.Formula = elt("Math", 2);
  exports.RawInline = elt("RawInline", 2);
  exports.Link = elt("Link", 3);
  exports.Image = elt("Image", 3);
  exports.Note = elt("Note", 1);
  exports.Span = elt("Span", 2);
  exports.stdio = toJSONFilter2;
});
var __pika_web_default_export_for_treeshaking__ = /* @__PURE__ */ getDefaultExportFromCjs(pandocFilter);
var BlockQuote = pandocFilter.BlockQuote;
var BulletList = pandocFilter.BulletList;
var Cite = pandocFilter.Cite;
var Code = pandocFilter.Code;
var CodeBlock = pandocFilter.CodeBlock;
var DefinitionList = pandocFilter.DefinitionList;
var Div = pandocFilter.Div;
var Emph = pandocFilter.Emph;
var Formula = pandocFilter.Formula;
var Header = pandocFilter.Header;
var HorizontalRule = pandocFilter.HorizontalRule;
var Image = pandocFilter.Image;
var LineBreak = pandocFilter.LineBreak;
var Link = pandocFilter.Link;
var Note = pandocFilter.Note;
var Null = pandocFilter.Null;
var OrderedList = pandocFilter.OrderedList;
var Para = pandocFilter.Para;
var Plain = pandocFilter.Plain;
var Quoted = pandocFilter.Quoted;
var RawBlock = pandocFilter.RawBlock;
var RawInline = pandocFilter.RawInline;
var SmallCaps = pandocFilter.SmallCaps;
var Space = pandocFilter.Space;
var Span = pandocFilter.Span;
var Str = pandocFilter.Str;
var Strikeout = pandocFilter.Strikeout;
var Strong = pandocFilter.Strong;
var Subscript = pandocFilter.Subscript;
var Superscript = pandocFilter.Superscript;
var Table = pandocFilter.Table;
var attributes = pandocFilter.attributes;
export default __pika_web_default_export_for_treeshaking__;
var filter = pandocFilter.filter;
var metaMapToRaw = pandocFilter.metaMapToRaw;
var metaToRaw = pandocFilter.metaToRaw;
var rawToMeta = pandocFilter.rawToMeta;
var stdio = pandocFilter.stdio;
var stringify = pandocFilter.stringify;
var toJSONFilter = pandocFilter.toJSONFilter;
var walk = pandocFilter.walk;
var walkSync = pandocFilter.walkSync;
export {BlockQuote, BulletList, Cite, Code, CodeBlock, DefinitionList, Div, Emph, Formula, Header, HorizontalRule, Image, LineBreak, Link, Note, Null, OrderedList, Para, Plain, Quoted, RawBlock, RawInline, SmallCaps, Space, Span, Str, Strikeout, Strong, Subscript, Superscript, Table, pandocFilter as __moduleExports, attributes, filter, metaMapToRaw, metaToRaw, rawToMeta, stdio, stringify, toJSONFilter, walk, walkSync};
