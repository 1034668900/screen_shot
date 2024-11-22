"use strict";
const electron = require("electron");
const require$$1 = require("path");
const require$$3$1 = require("os");
const require$$0$1 = require("child_process");
const require$$0 = require("fs");
const require$$2 = require("constants");
const require$$5 = require("assert");
const require$$3 = require("events");
require("util");
const fs = require("fs/promises");
async function createCaptureWindow(createCaptureWindowProps2) {
  const { x, y, screenWidth, screenHeight, isDarwin: isDarwin2 } = createCaptureWindowProps2;
  let captureWindow = new electron.BrowserWindow({
    frame: false,
    fullscreen: !isDarwin2,
    width: screenWidth,
    height: screenHeight,
    x,
    y,
    transparent: true,
    resizable: false,
    movable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    //mac
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: require$$1.join(__dirname, "preload.js")
    }
  });
  captureWindow.setOpacity(1);
  captureWindow.setAlwaysOnTop(true, "screen-saver");
  captureWindow.setFullScreenable(false);
  captureWindow.setVisibleOnAllWorkspaces(true);
  captureWindow.on("closed", () => {
    captureWindow.destroy();
  });
  captureWindow.hide();
  await captureWindow.loadFile(
    require$$1.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var screenshotDesktop = { exports: {} };
var utils;
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils)
    return utils;
  hasRequiredUtils = 1;
  const fs2 = require$$0;
  function unlinkP(path) {
    return new Promise((resolve, reject) => {
      fs2.unlink(path, function(err) {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
  function readFileP(path) {
    return new Promise((resolve, reject) => {
      fs2.readFile(path, function(err, img) {
        if (err) {
          return reject(err);
        }
        resolve(img);
      });
    });
  }
  function readAndUnlinkP(path) {
    return new Promise((resolve, reject) => {
      readFileP(path).then((img) => {
        unlinkP(path).then(() => resolve(img)).catch(reject);
      }).catch(reject);
    });
  }
  function defaultAll(snapshot) {
    return new Promise((resolve, reject) => {
      snapshot.listDisplays().then((displays) => {
        const snapsP = displays.map(({ id }) => snapshot({ screen: id }));
        Promise.all(snapsP).then(resolve).catch(reject);
      }).catch(reject);
    });
  }
  utils = {
    unlinkP,
    readFileP,
    readAndUnlinkP,
    defaultAll
  };
  return utils;
}
var linux;
var hasRequiredLinux;
function requireLinux() {
  if (hasRequiredLinux)
    return linux;
  hasRequiredLinux = 1;
  const exec = require$$0$1.exec;
  const path = require$$1;
  const defaultAll = requireUtils().defaultAll;
  const EXAMPLE_DISPLAYS_OUTPUT = `Screen 0: minimum 320 x 200, current 5760 x 1080, maximum 8192 x 8192
eDP-1 connected (normal left inverted right x axis y axis)
  2560x1440     60.00 +
  1920x1440     60.00
  1856x1392     60.01
  1792x1344     60.01
  1920x1200     59.95
  1920x1080     59.93
  1600x1200     60.00
  1680x1050     59.95    59.88
  1600x1024     60.17
  1400x1050     59.98
  1280x1024     60.02
  1440x900      59.89
  1280x960      60.00
  1360x768      59.80    59.96
  1152x864      60.00
  1024x768      60.04    60.00
  960x720       60.00
  928x696       60.05
  896x672       60.01
  960x600       60.00
  960x540       59.99
  800x600       60.00    60.32    56.25
  840x525       60.01    59.88
  800x512       60.17
  700x525       59.98
  640x512       60.02
  720x450       59.89
  640x480       60.00    59.94
  680x384       59.80    59.96
  576x432       60.06
  512x384       60.00
  400x300       60.32    56.34
  320x240       60.05
DP-1 disconnected (normal left inverted right x axis y axis)
HDMI-1 connected primary 1920x1080+0+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2 disconnected (normal left inverted right x axis y axis)
HDMI-2 disconnected (normal left inverted right x axis y axis)
DP-2-1 connected 1920x1080+3840+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2-2 connected 1920x1080+1920+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2-3 disconnected (normal left inverted right x axis y axis)`;
  function parseDisplaysOutput(out) {
    return out.split("\n").filter((line) => line.indexOf(" connected ") > 0).filter((line) => line.search(/\dx\d/) > 0).map((line, ix) => {
      const parts = line.split(" ");
      const name = parts[0];
      const primary = parts[2] === "primary";
      const crop = primary ? parts[3] : parts[2];
      const resParts = crop.split(/[x+]/);
      const width = +resParts[0];
      const height = +resParts[1];
      const offsetX = +resParts[2];
      const offsetY = +resParts[3];
      return {
        width,
        height,
        name,
        id: name,
        offsetX,
        offsetY,
        primary,
        crop
      };
    });
  }
  function listDisplays() {
    return new Promise((resolve, reject) => {
      exec("xrandr", (err, stdout) => {
        if (err) {
          return reject(err);
        }
        return resolve(parseDisplaysOutput(stdout));
      });
    });
  }
  function maxBuffer(screens) {
    let total = 0;
    screens.forEach((screen) => {
      total += screen.height * screen.width;
    });
    return total;
  }
  function guessFiletype(filename) {
    switch (path.extname(filename)) {
      case ".jpg":
      case ".jpeg":
        return "jpeg";
      case ".png":
        return "png";
    }
    return "jpeg";
  }
  function linuxSnapshot(options = {}) {
    return new Promise((resolve, reject) => {
      listDisplays().then((screens) => {
        const screen = screens.find(options.screen ? (screen2) => screen2.id === options.screen : (screen2) => screen2.primary || screen2.id === "default") || screens[0];
        const filename = options.filename ? options.filename.replace(/"/g, '\\"') : "-";
        const execOptions = options.filename ? {} : {
          encoding: "buffer",
          maxBuffer: maxBuffer(screens)
        };
        const filetype = options.format || guessFiletype(filename);
        let commandLine = "";
        switch (options.linuxLibrary) {
          case "scrot":
            commandLine = `scrot "${filename}" -e -z "echo \\"${filename}\\""`;
            break;
          case "imagemagick":
          default:
            commandLine = `import -silent -window root -crop ${screen.crop} -screen ${filetype}:"${filename}" `;
            break;
        }
        exec(
          commandLine,
          execOptions,
          (err, stdout) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(options.filename ? path.resolve(options.filename) : stdout);
            }
          }
        );
      });
    });
  }
  linuxSnapshot.listDisplays = listDisplays;
  linuxSnapshot.parseDisplaysOutput = parseDisplaysOutput;
  linuxSnapshot.EXAMPLE_DISPLAYS_OUTPUT = EXAMPLE_DISPLAYS_OUTPUT;
  linuxSnapshot.all = () => defaultAll(linuxSnapshot);
  linux = linuxSnapshot;
  return linux;
}
var temp = { exports: {} };
var old = {};
var hasRequiredOld;
function requireOld() {
  if (hasRequiredOld)
    return old;
  hasRequiredOld = 1;
  var pathModule = require$$1;
  var isWindows = process.platform === "win32";
  var fs2 = require$$0;
  var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function rethrow() {
    var callback;
    if (DEBUG) {
      var backtrace = new Error();
      callback = debugCallback;
    } else
      callback = missingCallback;
    return callback;
    function debugCallback(err) {
      if (err) {
        backtrace.message = err.message;
        err = backtrace;
        missingCallback(err);
      }
    }
    function missingCallback(err) {
      if (err) {
        if (process.throwDeprecation)
          throw err;
        else if (!process.noDeprecation) {
          var msg = "fs: missing callback " + (err.stack || err.message);
          if (process.traceDeprecation)
            console.trace(msg);
          else
            console.error(msg);
        }
      }
    }
  }
  function maybeCallback(cb) {
    return typeof cb === "function" ? cb : rethrow();
  }
  pathModule.normalize;
  if (isWindows) {
    var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
  } else {
    var nextPartRe = /(.*?)(?:[\/]+|$)/g;
  }
  if (isWindows) {
    var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  } else {
    var splitRootRe = /^[\/]*/;
  }
  old.realpathSync = function realpathSync(p, cache) {
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs2.lstatSync(base);
        knownHard[base] = true;
      }
    }
    while (pos < p.length) {
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        continue;
      }
      var resolvedLink;
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        resolvedLink = cache[base];
      } else {
        var stat = fs2.lstatSync(base);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache)
            cache[base] = base;
          continue;
        }
        var linkTarget = null;
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            linkTarget = seenLinks[id];
          }
        }
        if (linkTarget === null) {
          fs2.statSync(base);
          linkTarget = fs2.readlinkSync(base);
        }
        resolvedLink = pathModule.resolve(previous, linkTarget);
        if (cache)
          cache[base] = resolvedLink;
        if (!isWindows)
          seenLinks[id] = linkTarget;
      }
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
    if (cache)
      cache[original] = p;
    return p;
  };
  old.realpath = function realpath(p, cache, cb) {
    if (typeof cb !== "function") {
      cb = maybeCallback(cache);
      cache = null;
    }
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return process.nextTick(cb.bind(null, null, cache[p]));
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs2.lstat(base, function(err) {
          if (err)
            return cb(err);
          knownHard[base] = true;
          LOOP();
        });
      } else {
        process.nextTick(LOOP);
      }
    }
    function LOOP() {
      if (pos >= p.length) {
        if (cache)
          cache[original] = p;
        return cb(null, p);
      }
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        return process.nextTick(LOOP);
      }
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        return gotResolvedLink(cache[base]);
      }
      return fs2.lstat(base, gotStat);
    }
    function gotStat(err, stat) {
      if (err)
        return cb(err);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache)
          cache[base] = base;
        return process.nextTick(LOOP);
      }
      if (!isWindows) {
        var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          return gotTarget(null, seenLinks[id], base);
        }
      }
      fs2.stat(base, function(err2) {
        if (err2)
          return cb(err2);
        fs2.readlink(base, function(err3, target) {
          if (!isWindows)
            seenLinks[id] = target;
          gotTarget(err3, target);
        });
      });
    }
    function gotTarget(err, target, base2) {
      if (err)
        return cb(err);
      var resolvedLink = pathModule.resolve(previous, target);
      if (cache)
        cache[base2] = resolvedLink;
      gotResolvedLink(resolvedLink);
    }
    function gotResolvedLink(resolvedLink) {
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
  };
  return old;
}
var fs_realpath;
var hasRequiredFs_realpath;
function requireFs_realpath() {
  if (hasRequiredFs_realpath)
    return fs_realpath;
  hasRequiredFs_realpath = 1;
  fs_realpath = realpath;
  realpath.realpath = realpath;
  realpath.sync = realpathSync;
  realpath.realpathSync = realpathSync;
  realpath.monkeypatch = monkeypatch;
  realpath.unmonkeypatch = unmonkeypatch;
  var fs2 = require$$0;
  var origRealpath = fs2.realpath;
  var origRealpathSync = fs2.realpathSync;
  var version = process.version;
  var ok = /^v[0-5]\./.test(version);
  var old2 = requireOld();
  function newError(er) {
    return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
  }
  function realpath(p, cache, cb) {
    if (ok) {
      return origRealpath(p, cache, cb);
    }
    if (typeof cache === "function") {
      cb = cache;
      cache = null;
    }
    origRealpath(p, cache, function(er, result) {
      if (newError(er)) {
        old2.realpath(p, cache, cb);
      } else {
        cb(er, result);
      }
    });
  }
  function realpathSync(p, cache) {
    if (ok) {
      return origRealpathSync(p, cache);
    }
    try {
      return origRealpathSync(p, cache);
    } catch (er) {
      if (newError(er)) {
        return old2.realpathSync(p, cache);
      } else {
        throw er;
      }
    }
  }
  function monkeypatch() {
    fs2.realpath = realpath;
    fs2.realpathSync = realpathSync;
  }
  function unmonkeypatch() {
    fs2.realpath = origRealpath;
    fs2.realpathSync = origRealpathSync;
  }
  return fs_realpath;
}
var concatMap;
var hasRequiredConcatMap;
function requireConcatMap() {
  if (hasRequiredConcatMap)
    return concatMap;
  hasRequiredConcatMap = 1;
  concatMap = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      var x = fn(xs[i], i);
      if (isArray(x))
        res.push.apply(res, x);
      else
        res.push(x);
    }
    return res;
  };
  var isArray = Array.isArray || function(xs) {
    return Object.prototype.toString.call(xs) === "[object Array]";
  };
  return concatMap;
}
var balancedMatch;
var hasRequiredBalancedMatch;
function requireBalancedMatch() {
  if (hasRequiredBalancedMatch)
    return balancedMatch;
  hasRequiredBalancedMatch = 1;
  balancedMatch = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
  return balancedMatch;
}
var braceExpansion;
var hasRequiredBraceExpansion;
function requireBraceExpansion() {
  if (hasRequiredBraceExpansion)
    return braceExpansion;
  hasRequiredBraceExpansion = 1;
  var concatMap2 = requireConcatMap();
  var balanced = requireBalancedMatch();
  braceExpansion = expandTop;
  var escSlash = "\0SLASH" + Math.random() + "\0";
  var escOpen = "\0OPEN" + Math.random() + "\0";
  var escClose = "\0CLOSE" + Math.random() + "\0";
  var escComma = "\0COMMA" + Math.random() + "\0";
  var escPeriod = "\0PERIOD" + Math.random() + "\0";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m || /\$$/.test(m.pre))
      return [str];
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,.*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }
    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          var post = m.post.length ? expand(m.post, false) : [""];
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    var N;
    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);
      N = [];
      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\")
            c = "";
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join("0");
              if (i < 0)
                c = "-" + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = concatMap2(n, function(el) {
        return expand(el, false);
      });
    }
    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
    return expansions;
  }
  return braceExpansion;
}
var minimatch_1;
var hasRequiredMinimatch;
function requireMinimatch() {
  if (hasRequiredMinimatch)
    return minimatch_1;
  hasRequiredMinimatch = 1;
  minimatch_1 = minimatch;
  minimatch.Minimatch = Minimatch;
  var path = function() {
    try {
      return require("path");
    } catch (e) {
    }
  }() || {
    sep: "/"
  };
  minimatch.sep = path.sep;
  var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  var expand = requireBraceExpansion();
  var plTypes = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var reSpecials = charSet("().*{}+?[]^$\\!");
  function charSet(s) {
    return s.split("").reduce(function(set, c) {
      set[c] = true;
      return set;
    }, {});
  }
  var slashSplit = /\/+/;
  minimatch.filter = filter;
  function filter(pattern, options) {
    options = options || {};
    return function(p, i, list) {
      return minimatch(p, pattern, options);
    };
  }
  function ext(a, b) {
    b = b || {};
    var t = {};
    Object.keys(a).forEach(function(k) {
      t[k] = a[k];
    });
    Object.keys(b).forEach(function(k) {
      t[k] = b[k];
    });
    return t;
  }
  minimatch.defaults = function(def) {
    if (!def || typeof def !== "object" || !Object.keys(def).length) {
      return minimatch;
    }
    var orig = minimatch;
    var m = function minimatch2(p, pattern, options) {
      return orig(p, pattern, ext(def, options));
    };
    m.Minimatch = function Minimatch2(pattern, options) {
      return new orig.Minimatch(pattern, ext(def, options));
    };
    m.Minimatch.defaults = function defaults(options) {
      return orig.defaults(ext(def, options)).Minimatch;
    };
    m.filter = function filter2(pattern, options) {
      return orig.filter(pattern, ext(def, options));
    };
    m.defaults = function defaults(options) {
      return orig.defaults(ext(def, options));
    };
    m.makeRe = function makeRe2(pattern, options) {
      return orig.makeRe(pattern, ext(def, options));
    };
    m.braceExpand = function braceExpand2(pattern, options) {
      return orig.braceExpand(pattern, ext(def, options));
    };
    m.match = function(list, pattern, options) {
      return orig.match(list, pattern, ext(def, options));
    };
    return m;
  };
  Minimatch.defaults = function(def) {
    return minimatch.defaults(def).Minimatch;
  };
  function minimatch(p, pattern, options) {
    assertValidPattern(pattern);
    if (!options)
      options = {};
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    return new Minimatch(pattern, options).match(p);
  }
  function Minimatch(pattern, options) {
    if (!(this instanceof Minimatch)) {
      return new Minimatch(pattern, options);
    }
    assertValidPattern(pattern);
    if (!options)
      options = {};
    pattern = pattern.trim();
    if (!options.allowWindowsEscape && path.sep !== "/") {
      pattern = pattern.split(path.sep).join("/");
    }
    this.options = options;
    this.set = [];
    this.pattern = pattern;
    this.regexp = null;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.make();
  }
  Minimatch.prototype.debug = function() {
  };
  Minimatch.prototype.make = make;
  function make() {
    var pattern = this.pattern;
    var options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    var set = this.globSet = this.braceExpand();
    if (options.debug)
      this.debug = function debug() {
        console.error.apply(console, arguments);
      };
    this.debug(this.pattern, set);
    set = this.globParts = set.map(function(s) {
      return s.split(slashSplit);
    });
    this.debug(this.pattern, set);
    set = set.map(function(s, si, set2) {
      return s.map(this.parse, this);
    }, this);
    this.debug(this.pattern, set);
    set = set.filter(function(s) {
      return s.indexOf(false) === -1;
    });
    this.debug(this.pattern, set);
    this.set = set;
  }
  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate() {
    var pattern = this.pattern;
    var negate = false;
    var options = this.options;
    var negateOffset = 0;
    if (options.nonegate)
      return;
    for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }
  minimatch.braceExpand = function(pattern, options) {
    return braceExpand(pattern, options);
  };
  Minimatch.prototype.braceExpand = braceExpand;
  function braceExpand(pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }
    pattern = typeof pattern === "undefined" ? this.pattern : pattern;
    assertValidPattern(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      return [pattern];
    }
    return expand(pattern);
  }
  var MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = function(pattern) {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  Minimatch.prototype.parse = parse;
  var SUBPARSE = {};
  function parse(pattern, isSub) {
    assertValidPattern(pattern);
    var options = this.options;
    if (pattern === "**") {
      if (!options.noglobstar)
        return GLOBSTAR;
      else
        pattern = "*";
    }
    if (pattern === "")
      return "";
    var re = "";
    var hasMagic = !!options.nocase;
    var escaping = false;
    var patternListStack = [];
    var negativeLists = [];
    var stateChar;
    var inClass = false;
    var reClassStart = -1;
    var classStart = -1;
    var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
    var self = this;
    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case "*":
            re += star;
            hasMagic = true;
            break;
          case "?":
            re += qmark;
            hasMagic = true;
            break;
          default:
            re += "\\" + stateChar;
            break;
        }
        self.debug("clearStateChar %j %j", stateChar, re);
        stateChar = false;
      }
    }
    for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
      this.debug("%s	%s %s %j", pattern, i, re, c);
      if (escaping && reSpecials[c]) {
        re += "\\" + c;
        escaping = false;
        continue;
      }
      switch (c) {
        case "/": {
          return false;
        }
        case "\\":
          clearStateChar();
          escaping = true;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
          if (inClass) {
            this.debug("  in class");
            if (c === "!" && i === classStart + 1)
              c = "^";
            re += c;
            continue;
          }
          self.debug("call clearStateChar %j", stateChar);
          clearStateChar();
          stateChar = c;
          if (options.noext)
            clearStateChar();
          continue;
        case "(":
          if (inClass) {
            re += "(";
            continue;
          }
          if (!stateChar) {
            re += "\\(";
            continue;
          }
          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          re += stateChar === "!" ? "(?:(?!(?:" : "(?:";
          this.debug("plType %j %j", stateChar, re);
          stateChar = false;
          continue;
        case ")":
          if (inClass || !patternListStack.length) {
            re += "\\)";
            continue;
          }
          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          re += pl.close;
          if (pl.type === "!") {
            negativeLists.push(pl);
          }
          pl.reEnd = re.length;
          continue;
        case "|":
          if (inClass || !patternListStack.length || escaping) {
            re += "\\|";
            escaping = false;
            continue;
          }
          clearStateChar();
          re += "|";
          continue;
        case "[":
          clearStateChar();
          if (inClass) {
            re += "\\" + c;
            continue;
          }
          inClass = true;
          classStart = i;
          reClassStart = re.length;
          re += c;
          continue;
        case "]":
          if (i === classStart + 1 || !inClass) {
            re += "\\" + c;
            escaping = false;
            continue;
          }
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp("[" + cs + "]");
          } catch (er) {
            var sp = this.parse(cs, SUBPARSE);
            re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
          hasMagic = true;
          inClass = false;
          re += c;
          continue;
        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c] && !(c === "^" && inClass)) {
            re += "\\";
          }
          re += c;
      }
    }
    if (inClass) {
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re = re.substr(0, reClassStart) + "\\[" + sp[0];
      hasMagic = hasMagic || sp[1];
    }
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      var tail = re.slice(pl.reStart + pl.open.length);
      this.debug("setting tail", re, pl);
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
        if (!$2) {
          $2 = "\\";
        }
        return $1 + $1 + $2 + "|";
      });
      this.debug("tail=%j\n   %s", tail, tail, pl, re);
      var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
      hasMagic = true;
      re = re.slice(0, pl.reStart) + t + "\\(" + tail;
    }
    clearStateChar();
    if (escaping) {
      re += "\\\\";
    }
    var addPatternStart = false;
    switch (re.charAt(0)) {
      case "[":
      case ".":
      case "(":
        addPatternStart = true;
    }
    for (var n = negativeLists.length - 1; n > -1; n--) {
      var nl = negativeLists[n];
      var nlBefore = re.slice(0, nl.reStart);
      var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
      var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
      var nlAfter = re.slice(nl.reEnd);
      nlLast += nlAfter;
      var openParensBefore = nlBefore.split("(").length - 1;
      var cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
      }
      nlAfter = cleanAfter;
      var dollar = "";
      if (nlAfter === "" && isSub !== SUBPARSE) {
        dollar = "$";
      }
      var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re = newRe;
    }
    if (re !== "" && hasMagic) {
      re = "(?=.)" + re;
    }
    if (addPatternStart) {
      re = patternStart + re;
    }
    if (isSub === SUBPARSE) {
      return [re, hasMagic];
    }
    if (!hasMagic) {
      return globUnescape(pattern);
    }
    var flags = options.nocase ? "i" : "";
    try {
      var regExp = new RegExp("^" + re + "$", flags);
    } catch (er) {
      return new RegExp("$.");
    }
    regExp._glob = pattern;
    regExp._src = re;
    return regExp;
  }
  minimatch.makeRe = function(pattern, options) {
    return new Minimatch(pattern, options || {}).makeRe();
  };
  Minimatch.prototype.makeRe = makeRe;
  function makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    var set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    var options = this.options;
    var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
    var flags = options.nocase ? "i" : "";
    var re = set.map(function(pattern) {
      return pattern.map(function(p) {
        return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
      }).join("\\/");
    }).join("|");
    re = "^(?:" + re + ")$";
    if (this.negate)
      re = "^(?!" + re + ").*$";
    try {
      this.regexp = new RegExp(re, flags);
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  minimatch.match = function(list, pattern, options) {
    options = options || {};
    var mm = new Minimatch(pattern, options);
    list = list.filter(function(f) {
      return mm.match(f);
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  Minimatch.prototype.match = function match(f, partial) {
    if (typeof partial === "undefined")
      partial = this.partial;
    this.debug("match", f, this.pattern);
    if (this.comment)
      return false;
    if (this.empty)
      return f === "";
    if (f === "/" && partial)
      return true;
    var options = this.options;
    if (path.sep !== "/") {
      f = f.split(path.sep).join("/");
    }
    f = f.split(slashSplit);
    this.debug(this.pattern, "split", f);
    var set = this.set;
    this.debug(this.pattern, "set", set);
    var filename;
    var i;
    for (i = f.length - 1; i >= 0; i--) {
      filename = f[i];
      if (filename)
        break;
    }
    for (i = 0; i < set.length; i++) {
      var pattern = set[i];
      var file = f;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      var hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate)
          return true;
        return !this.negate;
      }
    }
    if (options.flipNegate)
      return false;
    return this.negate;
  };
  Minimatch.prototype.matchOne = function(file, pattern, partial) {
    var options = this.options;
    this.debug(
      "matchOne",
      { "this": this, file, pattern }
    );
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false)
        return false;
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (; fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
              return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
          if (fr === fl)
            return true;
        }
        return false;
      }
      var hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = f.match(p);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      return fi === fl - 1 && file[fi] === "";
    }
    throw new Error("wtf?");
  };
  function globUnescape(s) {
    return s.replace(/\\(.)/g, "$1");
  }
  function regExpEscape(s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return minimatch_1;
}
var inherits = { exports: {} };
var inherits_browser = { exports: {} };
var hasRequiredInherits_browser;
function requireInherits_browser() {
  if (hasRequiredInherits_browser)
    return inherits_browser.exports;
  hasRequiredInherits_browser = 1;
  if (typeof Object.create === "function") {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  return inherits_browser.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits)
    return inherits.exports;
  hasRequiredInherits = 1;
  try {
    var util = require("util");
    if (typeof util.inherits !== "function")
      throw "";
    inherits.exports = util.inherits;
  } catch (e) {
    inherits.exports = requireInherits_browser();
  }
  return inherits.exports;
}
var pathIsAbsolute = { exports: {} };
var hasRequiredPathIsAbsolute;
function requirePathIsAbsolute() {
  if (hasRequiredPathIsAbsolute)
    return pathIsAbsolute.exports;
  hasRequiredPathIsAbsolute = 1;
  function posix(path) {
    return path.charAt(0) === "/";
  }
  function win322(path) {
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path);
    var device = result[1] || "";
    var isUnc = Boolean(device && device.charAt(1) !== ":");
    return Boolean(result[2] || isUnc);
  }
  pathIsAbsolute.exports = process.platform === "win32" ? win322 : posix;
  pathIsAbsolute.exports.posix = posix;
  pathIsAbsolute.exports.win32 = win322;
  return pathIsAbsolute.exports;
}
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon)
    return common;
  hasRequiredCommon = 1;
  common.setopts = setopts;
  common.ownProp = ownProp;
  common.makeAbs = makeAbs;
  common.finish = finish;
  common.mark = mark;
  common.isIgnored = isIgnored;
  common.childrenIgnored = childrenIgnored;
  function ownProp(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
  }
  var fs2 = require$$0;
  var path = require$$1;
  var minimatch = requireMinimatch();
  var isAbsolute = requirePathIsAbsolute();
  var Minimatch = minimatch.Minimatch;
  function alphasort(a, b) {
    return a.localeCompare(b, "en");
  }
  function setupIgnores(self, options) {
    self.ignore = options.ignore || [];
    if (!Array.isArray(self.ignore))
      self.ignore = [self.ignore];
    if (self.ignore.length) {
      self.ignore = self.ignore.map(ignoreMap);
    }
  }
  function ignoreMap(pattern) {
    var gmatcher = null;
    if (pattern.slice(-3) === "/**") {
      var gpattern = pattern.replace(/(\/\*\*)+$/, "");
      gmatcher = new Minimatch(gpattern, { dot: true });
    }
    return {
      matcher: new Minimatch(pattern, { dot: true }),
      gmatcher
    };
  }
  function setopts(self, pattern, options) {
    if (!options)
      options = {};
    if (options.matchBase && -1 === pattern.indexOf("/")) {
      if (options.noglobstar) {
        throw new Error("base matching requires globstar");
      }
      pattern = "**/" + pattern;
    }
    self.silent = !!options.silent;
    self.pattern = pattern;
    self.strict = options.strict !== false;
    self.realpath = !!options.realpath;
    self.realpathCache = options.realpathCache || /* @__PURE__ */ Object.create(null);
    self.follow = !!options.follow;
    self.dot = !!options.dot;
    self.mark = !!options.mark;
    self.nodir = !!options.nodir;
    if (self.nodir)
      self.mark = true;
    self.sync = !!options.sync;
    self.nounique = !!options.nounique;
    self.nonull = !!options.nonull;
    self.nosort = !!options.nosort;
    self.nocase = !!options.nocase;
    self.stat = !!options.stat;
    self.noprocess = !!options.noprocess;
    self.absolute = !!options.absolute;
    self.fs = options.fs || fs2;
    self.maxLength = options.maxLength || Infinity;
    self.cache = options.cache || /* @__PURE__ */ Object.create(null);
    self.statCache = options.statCache || /* @__PURE__ */ Object.create(null);
    self.symlinks = options.symlinks || /* @__PURE__ */ Object.create(null);
    setupIgnores(self, options);
    self.changedCwd = false;
    var cwd = process.cwd();
    if (!ownProp(options, "cwd"))
      self.cwd = cwd;
    else {
      self.cwd = path.resolve(options.cwd);
      self.changedCwd = self.cwd !== cwd;
    }
    self.root = options.root || path.resolve(self.cwd, "/");
    self.root = path.resolve(self.root);
    if (process.platform === "win32")
      self.root = self.root.replace(/\\/g, "/");
    self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
    if (process.platform === "win32")
      self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
    self.nomount = !!options.nomount;
    options.nonegate = true;
    options.nocomment = true;
    options.allowWindowsEscape = false;
    self.minimatch = new Minimatch(pattern, options);
    self.options = self.minimatch.options;
  }
  function finish(self) {
    var nou = self.nounique;
    var all = nou ? [] : /* @__PURE__ */ Object.create(null);
    for (var i = 0, l = self.matches.length; i < l; i++) {
      var matches = self.matches[i];
      if (!matches || Object.keys(matches).length === 0) {
        if (self.nonull) {
          var literal = self.minimatch.globSet[i];
          if (nou)
            all.push(literal);
          else
            all[literal] = true;
        }
      } else {
        var m = Object.keys(matches);
        if (nou)
          all.push.apply(all, m);
        else
          m.forEach(function(m2) {
            all[m2] = true;
          });
      }
    }
    if (!nou)
      all = Object.keys(all);
    if (!self.nosort)
      all = all.sort(alphasort);
    if (self.mark) {
      for (var i = 0; i < all.length; i++) {
        all[i] = self._mark(all[i]);
      }
      if (self.nodir) {
        all = all.filter(function(e) {
          var notDir = !/\/$/.test(e);
          var c = self.cache[e] || self.cache[makeAbs(self, e)];
          if (notDir && c)
            notDir = c !== "DIR" && !Array.isArray(c);
          return notDir;
        });
      }
    }
    if (self.ignore.length)
      all = all.filter(function(m2) {
        return !isIgnored(self, m2);
      });
    self.found = all;
  }
  function mark(self, p) {
    var abs = makeAbs(self, p);
    var c = self.cache[abs];
    var m = p;
    if (c) {
      var isDir = c === "DIR" || Array.isArray(c);
      var slash = p.slice(-1) === "/";
      if (isDir && !slash)
        m += "/";
      else if (!isDir && slash)
        m = m.slice(0, -1);
      if (m !== p) {
        var mabs = makeAbs(self, m);
        self.statCache[mabs] = self.statCache[abs];
        self.cache[mabs] = self.cache[abs];
      }
    }
    return m;
  }
  function makeAbs(self, f) {
    var abs = f;
    if (f.charAt(0) === "/") {
      abs = path.join(self.root, f);
    } else if (isAbsolute(f) || f === "") {
      abs = f;
    } else if (self.changedCwd) {
      abs = path.resolve(self.cwd, f);
    } else {
      abs = path.resolve(f);
    }
    if (process.platform === "win32")
      abs = abs.replace(/\\/g, "/");
    return abs;
  }
  function isIgnored(self, path2) {
    if (!self.ignore.length)
      return false;
    return self.ignore.some(function(item) {
      return item.matcher.match(path2) || !!(item.gmatcher && item.gmatcher.match(path2));
    });
  }
  function childrenIgnored(self, path2) {
    if (!self.ignore.length)
      return false;
    return self.ignore.some(function(item) {
      return !!(item.gmatcher && item.gmatcher.match(path2));
    });
  }
  return common;
}
var sync;
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync)
    return sync;
  hasRequiredSync = 1;
  sync = globSync;
  globSync.GlobSync = GlobSync;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  requireGlob().Glob;
  var path = require$$1;
  var assert = require$$5;
  var isAbsolute = requirePathIsAbsolute();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  function globSync(pattern, options) {
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    return new GlobSync(pattern, options).found;
  }
  function GlobSync(pattern, options) {
    if (!pattern)
      throw new Error("must provide pattern");
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    if (!(this instanceof GlobSync))
      return new GlobSync(pattern, options);
    setopts(this, pattern, options);
    if (this.noprocess)
      return this;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }
  GlobSync.prototype._finish = function() {
    assert.ok(this instanceof GlobSync);
    if (this.realpath) {
      var self = this;
      this.matches.forEach(function(matchset, index) {
        var set = self.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var p in matchset) {
          try {
            p = self._makeAbs(p);
            var real = rp.realpathSync(p, self.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat")
              set[self._makeAbs(p)] = true;
            else
              throw er;
          }
        }
      });
    }
    common2.finish(this);
  };
  GlobSync.prototype._process = function(pattern, index, inGlobStar) {
    assert.ok(this instanceof GlobSync);
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return;
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
  };
  GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return;
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix.slice(-1) !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return;
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix)
        newPattern = [prefix, e];
      else
        newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  };
  GlobSync.prototype._emitMatch = function(index, e) {
    if (isIgnored(this, e))
      return;
    var abs = this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute) {
      e = abs;
    }
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    if (this.stat)
      this._stat(e);
  };
  GlobSync.prototype._readdirInGlobStar = function(abs) {
    if (this.follow)
      return this._readdir(abs, false);
    var entries;
    var lstat;
    try {
      lstat = this.fs.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        return null;
      }
    }
    var isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;
    if (!isSym && lstat && !lstat.isDirectory())
      this.cache[abs] = "FILE";
    else
      entries = this._readdir(abs, false);
    return entries;
  };
  GlobSync.prototype._readdir = function(abs, inGlobStar) {
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return null;
      if (Array.isArray(c))
        return c;
    }
    try {
      return this._readdirEntries(abs, this.fs.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  };
  GlobSync.prototype._readdirEntries = function(abs, entries) {
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return entries;
  };
  GlobSync.prototype._readdirError = function(f, er) {
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          throw error;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict)
          throw er;
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
  };
  GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false);
    var len = entries.length;
    var isSym = this.symlinks[abs];
    if (isSym && inGlobStar)
      return;
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  };
  GlobSync.prototype._processSimple = function(prefix, index) {
    var exists = this._stat(prefix);
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return;
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path.join(this.root, prefix);
      } else {
        prefix = path.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
  };
  GlobSync.prototype._stat = function(f) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return false;
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return c;
      if (needDir && c === "FILE")
        return false;
    }
    var stat = this.statCache[abs];
    if (!stat) {
      var lstat;
      try {
        lstat = this.fs.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }
      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat = this.fs.statSync(abs);
        } catch (er) {
          stat = lstat;
        }
      } else {
        stat = lstat;
      }
    }
    this.statCache[abs] = stat;
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return false;
    return c;
  };
  GlobSync.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  GlobSync.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  return sync;
}
var wrappy_1;
var hasRequiredWrappy;
function requireWrappy() {
  if (hasRequiredWrappy)
    return wrappy_1;
  hasRequiredWrappy = 1;
  wrappy_1 = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
  return wrappy_1;
}
var once = { exports: {} };
var hasRequiredOnce;
function requireOnce() {
  if (hasRequiredOnce)
    return once.exports;
  hasRequiredOnce = 1;
  var wrappy = requireWrappy();
  once.exports = wrappy(once$1);
  once.exports.strict = wrappy(onceStrict);
  once$1.proto = once$1(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once$1(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once$1(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
  return once.exports;
}
var inflight_1;
var hasRequiredInflight;
function requireInflight() {
  if (hasRequiredInflight)
    return inflight_1;
  hasRequiredInflight = 1;
  var wrappy = requireWrappy();
  var reqs = /* @__PURE__ */ Object.create(null);
  var once2 = requireOnce();
  inflight_1 = wrappy(inflight);
  function inflight(key, cb) {
    if (reqs[key]) {
      reqs[key].push(cb);
      return null;
    } else {
      reqs[key] = [cb];
      return makeres(key);
    }
  }
  function makeres(key) {
    return once2(function RES() {
      var cbs = reqs[key];
      var len = cbs.length;
      var args = slice(arguments);
      try {
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args);
        }
      } finally {
        if (cbs.length > len) {
          cbs.splice(0, len);
          process.nextTick(function() {
            RES.apply(null, args);
          });
        } else {
          delete reqs[key];
        }
      }
    });
  }
  function slice(args) {
    var length = args.length;
    var array = [];
    for (var i = 0; i < length; i++)
      array[i] = args[i];
    return array;
  }
  return inflight_1;
}
var glob_1;
var hasRequiredGlob;
function requireGlob() {
  if (hasRequiredGlob)
    return glob_1;
  hasRequiredGlob = 1;
  glob_1 = glob;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  var inherits2 = requireInherits();
  var EE = require$$3.EventEmitter;
  var path = require$$1;
  var assert = require$$5;
  var isAbsolute = requirePathIsAbsolute();
  var globSync = requireSync();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var inflight = requireInflight();
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  var once2 = requireOnce();
  function glob(pattern, options, cb) {
    if (typeof options === "function")
      cb = options, options = {};
    if (!options)
      options = {};
    if (options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return globSync(pattern, options);
    }
    return new Glob(pattern, options, cb);
  }
  glob.sync = globSync;
  var GlobSync = glob.GlobSync = globSync.GlobSync;
  glob.glob = glob;
  function extend(origin, add) {
    if (add === null || typeof add !== "object") {
      return origin;
    }
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  glob.hasMagic = function(pattern, options_) {
    var options = extend({}, options_);
    options.noprocess = true;
    var g = new Glob(pattern, options);
    var set = g.minimatch.set;
    if (!pattern)
      return false;
    if (set.length > 1)
      return true;
    for (var j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== "string")
        return true;
    }
    return false;
  };
  glob.Glob = Glob;
  inherits2(Glob, EE);
  function Glob(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }
    if (options && options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }
    if (!(this instanceof Glob))
      return new Glob(pattern, options, cb);
    setopts(this, pattern, options);
    this._didRealPath = false;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    if (typeof cb === "function") {
      cb = once2(cb);
      this.on("error", cb);
      this.on("end", function(matches) {
        cb(null, matches);
      });
    }
    var self = this;
    this._processing = 0;
    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;
    if (this.noprocess)
      return this;
    if (n === 0)
      return done();
    var sync2 = true;
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync2 = false;
    function done() {
      --self._processing;
      if (self._processing <= 0) {
        if (sync2) {
          process.nextTick(function() {
            self._finish();
          });
        } else {
          self._finish();
        }
      }
    }
  }
  Glob.prototype._finish = function() {
    assert(this instanceof Glob);
    if (this.aborted)
      return;
    if (this.realpath && !this._didRealpath)
      return this._realpath();
    common2.finish(this);
    this.emit("end", this.found);
  };
  Glob.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = true;
    var n = this.matches.length;
    if (n === 0)
      return this._finish();
    var self = this;
    for (var i = 0; i < this.matches.length; i++)
      this._realpathSet(i, next);
    function next() {
      if (--n === 0)
        self._finish();
    }
  };
  Glob.prototype._realpathSet = function(index, cb) {
    var matchset = this.matches[index];
    if (!matchset)
      return cb();
    var found = Object.keys(matchset);
    var self = this;
    var n = found.length;
    if (n === 0)
      return cb();
    var set = this.matches[index] = /* @__PURE__ */ Object.create(null);
    found.forEach(function(p, i) {
      p = self._makeAbs(p);
      rp.realpath(p, self.realpathCache, function(er, real) {
        if (!er)
          set[real] = true;
        else if (er.syscall === "stat")
          set[p] = true;
        else
          self.emit("error", er);
        if (--n === 0) {
          self.matches[index] = set;
          cb();
        }
      });
    });
  };
  Glob.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  Glob.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  Glob.prototype.abort = function() {
    this.aborted = true;
    this.emit("abort");
  };
  Glob.prototype.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  };
  Glob.prototype.resume = function() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        var eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          var e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        var pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          var p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  };
  Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
    assert(this instanceof Glob);
    assert(typeof cb === "function");
    if (this.aborted)
      return;
    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return cb();
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  };
  Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return cb();
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return cb();
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix !== "/")
          e = prefix + "/" + e;
        else
          e = prefix + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  };
  Glob.prototype._emitMatch = function(index, e) {
    if (this.aborted)
      return;
    if (isIgnored(this, e))
      return;
    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }
    var abs = isAbsolute(e) ? e : this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute)
      e = abs;
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    var st = this.statCache[abs];
    if (st)
      this.emit("stat", e, st);
    this.emit("match", e);
  };
  Glob.prototype._readdirInGlobStar = function(abs, cb) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(abs, false, cb);
    var lstatkey = "lstat\0" + abs;
    var self = this;
    var lstatcb = inflight(lstatkey, lstatcb_);
    if (lstatcb)
      self.fs.lstat(abs, lstatcb);
    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT")
        return cb();
      var isSym = lstat && lstat.isSymbolicLink();
      self.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) {
        self.cache[abs] = "FILE";
        cb();
      } else
        self._readdir(abs, false, cb);
    }
  };
  Glob.prototype._readdir = function(abs, inGlobStar, cb) {
    if (this.aborted)
      return;
    cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
    if (!cb)
      return;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return cb();
      if (Array.isArray(c))
        return cb(null, c);
    }
    var self = this;
    self.fs.readdir(abs, readdirCb(this, abs, cb));
  };
  function readdirCb(self, abs, cb) {
    return function(er, entries) {
      if (er)
        self._readdirError(abs, er, cb);
      else
        self._readdirEntries(abs, entries, cb);
    };
  }
  Glob.prototype._readdirEntries = function(abs, entries, cb) {
    if (this.aborted)
      return;
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return cb(null, entries);
  };
  Glob.prototype._readdirError = function(f, er, cb) {
    if (this.aborted)
      return;
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          this.emit("error", error);
          this.abort();
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          this.abort();
        }
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
    return cb();
  };
  Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false, cb);
    var isSym = this.symlinks[abs];
    var len = entries.length;
    if (isSym && inGlobStar)
      return cb();
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }
    cb();
  };
  Glob.prototype._processSimple = function(prefix, index, cb) {
    var self = this;
    this._stat(prefix, function(er, exists) {
      self._processSimple2(prefix, index, er, exists, cb);
    });
  };
  Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return cb();
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path.join(this.root, prefix);
      } else {
        prefix = path.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
    cb();
  };
  Glob.prototype._stat = function(f, cb) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return cb();
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return cb(null, c);
      if (needDir && c === "FILE")
        return cb();
    }
    var stat = this.statCache[abs];
    if (stat !== void 0) {
      if (stat === false)
        return cb(null, stat);
      else {
        var type = stat.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE")
          return cb();
        else
          return cb(null, type, stat);
      }
    }
    var self = this;
    var statcb = inflight("stat\0" + abs, lstatcb_);
    if (statcb)
      self.fs.lstat(abs, statcb);
    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return self.fs.stat(abs, function(er2, stat2) {
          if (er2)
            self._stat2(f, abs, null, lstat, cb);
          else
            self._stat2(f, abs, er2, stat2, cb);
        });
      } else {
        self._stat2(f, abs, er, lstat, cb);
      }
    }
  };
  Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }
    var needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat;
    if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
      return cb(null, false, stat);
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return cb();
    return cb(null, c, stat);
  };
  return glob_1;
}
var rimraf_1;
var hasRequiredRimraf;
function requireRimraf() {
  if (hasRequiredRimraf)
    return rimraf_1;
  hasRequiredRimraf = 1;
  rimraf_1 = rimraf;
  rimraf.sync = rimrafSync;
  var assert = require$$5;
  var path = require$$1;
  var fs2 = require$$0;
  var glob = requireGlob();
  var _0666 = parseInt("666", 8);
  var defaultGlobOpts = {
    nosort: true,
    silent: true
  };
  var timeout = 0;
  var isWindows = process.platform === "win32";
  function defaults(options) {
    var methods = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    methods.forEach(function(m) {
      options[m] = options[m] || fs2[m];
      m = m + "Sync";
      options[m] = options[m] || fs2[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
    options.emfileWait = options.emfileWait || 1e3;
    if (options.glob === false) {
      options.disableGlob = true;
    }
    options.disableGlob = options.disableGlob || false;
    options.glob = options.glob || defaultGlobOpts;
  }
  function rimraf(p, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert.equal(typeof cb, "function", "rimraf: callback function required");
    assert(options, "rimraf: invalid options argument provided");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    defaults(options);
    var busyTries = 0;
    var errState = null;
    var n = 0;
    if (options.disableGlob || !glob.hasMagic(p))
      return afterGlob(null, [p]);
    options.lstat(p, function(er, stat) {
      if (!er)
        return afterGlob(null, [p]);
      glob(p, options.glob, afterGlob);
    });
    function next(er) {
      errState = errState || er;
      if (--n === 0)
        cb(errState);
    }
    function afterGlob(er, results) {
      if (er)
        return cb(er);
      n = results.length;
      if (n === 0)
        return cb();
      results.forEach(function(p2) {
        rimraf_(p2, options, function CB(er2) {
          if (er2) {
            if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
              busyTries++;
              var time = busyTries * 100;
              return setTimeout(function() {
                rimraf_(p2, options, CB);
              }, time);
            }
            if (er2.code === "EMFILE" && timeout < options.emfileWait) {
              return setTimeout(function() {
                rimraf_(p2, options, CB);
              }, timeout++);
            }
            if (er2.code === "ENOENT")
              er2 = null;
          }
          timeout = 0;
          next(er2);
        });
      });
    }
  }
  function rimraf_(p, options, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.lstat(p, function(er, st) {
      if (er && er.code === "ENOENT")
        return cb(null);
      if (er && er.code === "EPERM" && isWindows)
        fixWinEPERM(p, options, er, cb);
      if (st && st.isDirectory())
        return rmdir(p, options, er, cb);
      options.unlink(p, function(er2) {
        if (er2) {
          if (er2.code === "ENOENT")
            return cb(null);
          if (er2.code === "EPERM")
            return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
          if (er2.code === "EISDIR")
            return rmdir(p, options, er2, cb);
        }
        return cb(er2);
      });
    });
  }
  function fixWinEPERM(p, options, er, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    if (er)
      assert(er instanceof Error);
    options.chmod(p, _0666, function(er2) {
      if (er2)
        cb(er2.code === "ENOENT" ? null : er);
      else
        options.stat(p, function(er3, stats) {
          if (er3)
            cb(er3.code === "ENOENT" ? null : er);
          else if (stats.isDirectory())
            rmdir(p, options, er, cb);
          else
            options.unlink(p, cb);
        });
    });
  }
  function fixWinEPERMSync(p, options, er) {
    assert(p);
    assert(options);
    if (er)
      assert(er instanceof Error);
    try {
      options.chmodSync(p, _0666);
    } catch (er2) {
      if (er2.code === "ENOENT")
        return;
      else
        throw er;
    }
    try {
      var stats = options.statSync(p);
    } catch (er3) {
      if (er3.code === "ENOENT")
        return;
      else
        throw er;
    }
    if (stats.isDirectory())
      rmdirSync(p, options, er);
    else
      options.unlinkSync(p);
  }
  function rmdir(p, options, originalEr, cb) {
    assert(p);
    assert(options);
    if (originalEr)
      assert(originalEr instanceof Error);
    assert(typeof cb === "function");
    options.rmdir(p, function(er) {
      if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
        rmkids(p, options, cb);
      else if (er && er.code === "ENOTDIR")
        cb(originalEr);
      else
        cb(er);
    });
  }
  function rmkids(p, options, cb) {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.readdir(p, function(er, files) {
      if (er)
        return cb(er);
      var n = files.length;
      if (n === 0)
        return options.rmdir(p, cb);
      var errState;
      files.forEach(function(f) {
        rimraf(path.join(p, f), options, function(er2) {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--n === 0)
            options.rmdir(p, cb);
        });
      });
    });
  }
  function rimrafSync(p, options) {
    options = options || {};
    defaults(options);
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert(options, "rimraf: missing options");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    var results;
    if (options.disableGlob || !glob.hasMagic(p)) {
      results = [p];
    } else {
      try {
        options.lstatSync(p);
        results = [p];
      } catch (er) {
        results = glob.sync(p, options.glob);
      }
    }
    if (!results.length)
      return;
    for (var i = 0; i < results.length; i++) {
      var p = results[i];
      try {
        var st = options.lstatSync(p);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM" && isWindows)
          fixWinEPERMSync(p, options, er);
      }
      try {
        if (st && st.isDirectory())
          rmdirSync(p, options, null);
        else
          options.unlinkSync(p);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM")
          return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
        if (er.code !== "EISDIR")
          throw er;
        rmdirSync(p, options, er);
      }
    }
  }
  function rmdirSync(p, options, originalEr) {
    assert(p);
    assert(options);
    if (originalEr)
      assert(originalEr instanceof Error);
    try {
      options.rmdirSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "ENOTDIR")
        throw originalEr;
      if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
        rmkidsSync(p, options);
    }
  }
  function rmkidsSync(p, options) {
    assert(p);
    assert(options);
    options.readdirSync(p).forEach(function(f) {
      rimrafSync(path.join(p, f), options);
    });
    var retries = isWindows ? 100 : 1;
    var i = 0;
    do {
      var threw = true;
      try {
        var ret = options.rmdirSync(p, options);
        threw = false;
        return ret;
      } finally {
        if (++i < retries && threw)
          continue;
      }
    } while (true);
  }
  return rimraf_1;
}
var mkdirp;
var hasRequiredMkdirp;
function requireMkdirp() {
  if (hasRequiredMkdirp)
    return mkdirp;
  hasRequiredMkdirp = 1;
  var path = require$$1;
  var fs2 = require$$0;
  var _0777 = parseInt("0777", 8);
  mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
  function mkdirP(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made)
      made = null;
    var cb = f || /* istanbul ignore next */
    function() {
    };
    p = path.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          if (path.dirname(p) === p)
            return cb(er);
          mkdirP(path.dirname(p), opts, function(er2, made2) {
            if (er2)
              cb(er2, made2);
            else
              mkdirP(p, opts, cb, made2);
          });
          break;
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory())
              cb(er, made);
            else
              cb(null, made);
          });
          break;
      }
    });
  }
  mkdirP.sync = function sync2(p, opts, made) {
    if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made)
      made = null;
    p = path.resolve(p);
    try {
      xfs.mkdirSync(p, mode);
      made = made || p;
    } catch (err0) {
      switch (err0.code) {
        case "ENOENT":
          made = sync2(path.dirname(p), opts, made);
          sync2(p, opts, made);
          break;
        default:
          var stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory())
            throw err0;
          break;
      }
    }
    return made;
  };
  return mkdirp;
}
var hasRequiredTemp;
function requireTemp() {
  if (hasRequiredTemp)
    return temp.exports;
  hasRequiredTemp = 1;
  (function(module, exports) {
    let fs2 = require$$0;
    let path = require$$1;
    let cnst = require$$2;
    let os = require$$3$1;
    let rimraf = requireRimraf();
    let mkdirp2 = requireMkdirp();
    require$$3$1.tmpdir();
    const rimrafSync = rimraf.sync;
    let dir = path.resolve(os.tmpdir());
    let RDWR_EXCL = cnst.O_CREAT | cnst.O_TRUNC | cnst.O_RDWR | cnst.O_EXCL;
    let promisify = function(callback) {
      if (typeof callback === "function") {
        return [void 0, callback];
      }
      var promiseCallback;
      var promise = new Promise(function(resolve, reject) {
        promiseCallback = function() {
          var args = Array.from(arguments);
          var err = args.shift();
          process.nextTick(function() {
            if (err) {
              reject(err);
            } else if (args.length === 1) {
              resolve(args[0]);
            } else {
              resolve(args);
            }
          });
        };
      });
      return [promise, promiseCallback];
    };
    var generateName = function(rawAffixes, defaultPrefix) {
      var affixes = parseAffixes(rawAffixes, defaultPrefix);
      var now = /* @__PURE__ */ new Date();
      var name = [
        affixes.prefix,
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        "-",
        process.pid,
        "-",
        (Math.random() * 4294967296 + 1).toString(36),
        affixes.suffix
      ].join("");
      return path.join(affixes.dir || dir, name);
    };
    var parseAffixes = function(rawAffixes, defaultPrefix) {
      var affixes = { prefix: null, suffix: null };
      if (rawAffixes) {
        switch (typeof rawAffixes) {
          case "string":
            affixes.prefix = rawAffixes;
            break;
          case "object":
            affixes = rawAffixes;
            break;
          default:
            throw new Error("Unknown affix declaration: " + affixes);
        }
      } else {
        affixes.prefix = defaultPrefix;
      }
      return affixes;
    };
    var tracking = false;
    var track = function(value) {
      tracking = value !== false;
      return module.exports;
    };
    var exitListenerAttached = false;
    var filesToDelete = [];
    var dirsToDelete = [];
    function deleteFileOnExit(filePath) {
      if (!tracking)
        return false;
      attachExitListener();
      filesToDelete.push(filePath);
    }
    function deleteDirOnExit(dirPath) {
      if (!tracking)
        return false;
      attachExitListener();
      dirsToDelete.push(dirPath);
    }
    function attachExitListener() {
      if (!tracking)
        return false;
      if (!exitListenerAttached) {
        process.addListener("exit", function() {
          try {
            cleanupSync();
          } catch (err) {
            console.warn("Fail to clean temporary files on exit : ", err);
            throw err;
          }
        });
        exitListenerAttached = true;
      }
    }
    function cleanupFilesSync() {
      if (!tracking) {
        return false;
      }
      var count = 0;
      var toDelete;
      while ((toDelete = filesToDelete.shift()) !== void 0) {
        rimrafSync(toDelete, { maxBusyTries: 6 });
        count++;
      }
      return count;
    }
    function cleanupFiles(callback) {
      var p = promisify(callback);
      var promise = p[0];
      callback = p[1];
      if (!tracking) {
        callback(new Error("not tracking"));
        return promise;
      }
      var count = 0;
      var left = filesToDelete.length;
      if (!left) {
        callback(null, count);
        return promise;
      }
      var toDelete;
      var rimrafCallback = function(err) {
        if (!left) {
          return;
        }
        if (err) {
          callback(err);
          left = 0;
          return;
        } else {
          count++;
        }
        left--;
        if (!left) {
          callback(null, count);
        }
      };
      while ((toDelete = filesToDelete.shift()) !== void 0) {
        rimraf(toDelete, { maxBusyTries: 6 }, rimrafCallback);
      }
      return promise;
    }
    function cleanupDirsSync() {
      if (!tracking) {
        return false;
      }
      var count = 0;
      var toDelete;
      while ((toDelete = dirsToDelete.shift()) !== void 0) {
        rimrafSync(toDelete, { maxBusyTries: 6 });
        count++;
      }
      return count;
    }
    function cleanupDirs(callback) {
      var p = promisify(callback);
      var promise = p[0];
      callback = p[1];
      if (!tracking) {
        callback(new Error("not tracking"));
        return promise;
      }
      var count = 0;
      var left = dirsToDelete.length;
      if (!left) {
        callback(null, count);
        return promise;
      }
      var toDelete;
      var rimrafCallback = function(err) {
        if (!left) {
          return;
        }
        if (err) {
          callback(err, count);
          left = 0;
          return;
        } else {
          count++;
        }
        left--;
        if (!left) {
          callback(null, count);
        }
      };
      while ((toDelete = dirsToDelete.shift()) !== void 0) {
        rimraf(toDelete, { maxBusyTries: 6 }, rimrafCallback);
      }
      return promise;
    }
    function cleanupSync() {
      if (!tracking) {
        return false;
      }
      var fileCount = cleanupFilesSync();
      var dirCount = cleanupDirsSync();
      return { files: fileCount, dirs: dirCount };
    }
    function cleanup(callback) {
      var p = promisify(callback);
      var promise = p[0];
      callback = p[1];
      if (!tracking) {
        callback(new Error("not tracking"));
        return promise;
      }
      cleanupFiles(function(fileErr, fileCount) {
        if (fileErr) {
          callback(fileErr, { files: fileCount });
        } else {
          cleanupDirs(function(dirErr, dirCount) {
            callback(dirErr, { files: fileCount, dirs: dirCount });
          });
        }
      });
      return promise;
    }
    const mkdir = (affixes, callback) => {
      const p = promisify(callback);
      const promise = p[0];
      callback = p[1];
      let dirPath = generateName(affixes, "d-");
      mkdirp2(dirPath, 448, (err) => {
        if (!err) {
          deleteDirOnExit(dirPath);
        }
        callback(err, dirPath);
      });
      return promise;
    };
    const mkdirSync = (affixes) => {
      let dirPath = generateName(affixes, "d-");
      mkdirp2.sync(dirPath, 448);
      deleteDirOnExit(dirPath);
      return dirPath;
    };
    const open = (affixes, callback) => {
      const p = promisify(callback);
      const promise = p[0];
      callback = p[1];
      const path2 = generateName(affixes, "f-");
      fs2.open(path2, RDWR_EXCL, 384, (err, fd) => {
        if (!err) {
          deleteFileOnExit(path2);
        }
        callback(err, { path: path2, fd });
      });
      return promise;
    };
    const openSync = (affixes) => {
      const path2 = generateName(affixes, "f-");
      let fd = fs2.openSync(path2, RDWR_EXCL, 384);
      deleteFileOnExit(path2);
      return { path: path2, fd };
    };
    const createWriteStream = (affixes) => {
      const path2 = generateName(affixes, "s-");
      let stream = fs2.createWriteStream(path2, { flags: RDWR_EXCL, mode: 384 });
      deleteFileOnExit(path2);
      return stream;
    };
    exports.dir = dir;
    exports.track = track;
    exports.mkdir = mkdir;
    exports.mkdirSync = mkdirSync;
    exports.open = open;
    exports.openSync = openSync;
    exports.path = generateName;
    exports.cleanup = cleanup;
    exports.cleanupSync = cleanupSync;
    exports.createWriteStream = createWriteStream;
  })(temp, temp.exports);
  return temp.exports;
}
var darwin;
var hasRequiredDarwin;
function requireDarwin() {
  if (hasRequiredDarwin)
    return darwin;
  hasRequiredDarwin = 1;
  const exec = require$$0$1.exec;
  const temp2 = requireTemp();
  const fs2 = require$$0;
  const utils2 = requireUtils();
  const path = require$$1;
  const { unlinkP, readAndUnlinkP } = utils2;
  function darwinSnapshot(options = {}) {
    const performScreenCapture = (displays) => new Promise((resolve, reject) => {
      const totalDisplays = displays.length;
      if (totalDisplays === 0) {
        return reject(new Error("No displays detected try dropping screen option"));
      }
      const maxDisplayId = totalDisplays - 1;
      const displayId = options.screen || 0;
      if (!Number.isInteger(displayId) || displayId < 0 || displayId > maxDisplayId) {
        const validChoiceMsg = maxDisplayId === 0 ? "(valid choice is 0 or drop screen option altogether)" : `(valid choice is an integer between 0 and ${maxDisplayId})`;
        return reject(new Error(`Invalid choice of displayId: ${displayId} ${validChoiceMsg}`));
      }
      const format = options.format || "jpg";
      let filename;
      let suffix;
      if (options.filename) {
        const ix = options.filename.lastIndexOf(".");
        suffix = ix >= 0 ? options.filename.slice(ix) : `.${format}`;
        filename = '"' + options.filename.replace(/"/g, '\\"') + '"';
      } else {
        suffix = `.${format}`;
      }
      const tmpPaths = Array(displayId + 1).fill(null).map(() => temp2.path({ suffix }));
      let pathsToUse = [];
      if (options.filename) {
        tmpPaths[displayId] = filename;
      }
      pathsToUse = tmpPaths.slice(0, displayId + 1);
      exec(
        "screencapture -x -t " + format + " " + pathsToUse.join(" "),
        function(err, stdOut) {
          if (err) {
            return reject(err);
          } else if (options.filename) {
            resolve(path.resolve(options.filename));
          } else {
            fs2.readFile(tmpPaths[displayId], function(err2, img) {
              if (err2) {
                return reject(err2);
              }
              Promise.all(pathsToUse.map(unlinkP)).then(() => resolve(img)).catch((err3) => reject(err3));
            });
          }
        }
      );
    });
    return listDisplays().then((displays) => {
      return performScreenCapture(displays);
    });
  }
  const EXAMPLE_DISPLAYS_OUTPUT = `
Graphics/Displays:

    Intel Iris:

      Chipset Model: Intel Iris
      Type: GPU
      Bus: Built-In
      VRAM (Dynamic, Max): 1536 MB
      Vendor: Intel (0x8086)
      Device ID: 0x0a2e
      Revision ID: 0x0009
      Displays:
        Color LCD:
          Display Type: Retina LCD
          Resolution: 2560 x 1600 Retina
          Retina: Yes
          Pixel Depth: 32-Bit Color (ARGB8888)
          Main Display: Yes
          Mirror: Off
          Online: Yes
          Built-In: Yes
        HP 22cwa:
          Resolution: 1920 x 1080 @ 60Hz (1080p)
          Pixel Depth: 32-Bit Color (ARGB8888)
          Display Serial Number: 6CM7201231
          Mirror: Off
          Online: Yes
          Rotation: Supported
          Television: Yes
`;
  function extractEntries(output) {
    const entries = [];
    const entryPattern = /(\s*)(.*?):(.*)\n/g;
    let match;
    while ((match = entryPattern.exec(output)) !== null) {
      entries.push({
        indent: match[1].length,
        key: match[2].trim(),
        value: match[3].trim()
      });
    }
    return entries;
  }
  function makeSubtree(currIndent, subtree, entries) {
    let entry;
    while (entry = entries.shift()) {
      if (entry.value === "") {
        if (currIndent < entry.indent) {
          while (entry.key in subtree) {
            entry.key += "_1";
          }
          subtree[entry.key] = {};
          makeSubtree(entry.indent, subtree[entry.key], entries);
        } else {
          entries.unshift(entry);
          return;
        }
      } else {
        while (entry.key in subtree) {
          entry.key += "_1";
        }
        subtree[entry.key] = entry.value;
      }
    }
  }
  function movePrimaryToHead(displays) {
    const primary = displays.filter((e) => e.primary);
    const notPrimary = displays.filter((e) => !e.primary);
    return [...primary, ...notPrimary];
  }
  function addId(displays) {
    let id = 0;
    return displays.map((display) => {
      return Object.assign({}, display, { id: id++ });
    });
  }
  function parseDisplaysOutput(output) {
    const tree = {};
    makeSubtree(-1, tree, extractEntries(output));
    if (!tree["Graphics/Displays"]) {
      return [];
    }
    const firstGpuKeys = Object.keys(tree["Graphics/Displays"]);
    if (!firstGpuKeys || firstGpuKeys.length <= 0) {
      return [];
    }
    let displayinfos = [];
    firstGpuKeys.forEach((gpukey) => {
      const gpu = tree["Graphics/Displays"][gpukey];
      if (gpu.Displays) {
        const temp3 = Object.entries(gpu.Displays).map(([name, props]) => {
          const primary = props["Main Display"] === "Yes";
          return { name, primary };
        });
        displayinfos = displayinfos.concat(temp3);
      }
    });
    return addId(movePrimaryToHead(displayinfos));
  }
  function listDisplays() {
    return new Promise((resolve, reject) => {
      exec(
        "system_profiler SPDisplaysDataType",
        (err, stdout) => {
          if (err) {
            return reject(err);
          }
          resolve(parseDisplaysOutput(stdout));
        }
      );
    });
  }
  function all() {
    return new Promise((resolve, reject) => {
      listDisplays().then((displays) => {
        const tmpPaths = displays.map(() => temp2.path({ suffix: ".jpg" }));
        exec("screencapture -x -t jpg " + tmpPaths.join(" "), function(err, stdOut) {
          if (err) {
            return reject(err);
          } else {
            Promise.all(tmpPaths.map(readAndUnlinkP)).then(resolve).catch(reject);
          }
        });
      });
    });
  }
  darwinSnapshot.listDisplays = listDisplays;
  darwinSnapshot.all = all;
  darwinSnapshot.parseDisplaysOutput = parseDisplaysOutput;
  darwinSnapshot.EXAMPLE_DISPLAYS_OUTPUT = EXAMPLE_DISPLAYS_OUTPUT;
  darwin = darwinSnapshot;
  return darwin;
}
var win32;
var hasRequiredWin32;
function requireWin32() {
  if (hasRequiredWin32)
    return win32;
  hasRequiredWin32 = 1;
  const exec = require$$0$1.exec;
  const temp2 = requireTemp();
  const path = require$$1;
  const utils2 = requireUtils();
  const fs2 = require$$0;
  const os = require$$3$1;
  const {
    readAndUnlinkP,
    defaultAll
  } = utils2;
  function copyToTemp() {
    const tmpBat = path.join(os.tmpdir(), "screenCapture", "screenCapture_1.3.2.bat");
    const tmpManifest = path.join(os.tmpdir(), "screenCapture", "app.manifest");
    const includeBat = path.join(__dirname, "screenCapture_1.3.2.bat").replace("app.asar", "app.asar.unpacked");
    const includeManifest = path.join(__dirname, "app.manifest").replace("app.asar", "app.asar.unpacked");
    if (!fs2.existsSync(tmpBat)) {
      const tmpDir = path.join(os.tmpdir(), "screenCapture");
      if (!fs2.existsSync(tmpDir)) {
        fs2.mkdirSync(tmpDir);
      }
      const sourceData = {
        bat: fs2.readFileSync(includeBat),
        manifest: fs2.readFileSync(includeManifest)
      };
      fs2.writeFileSync(tmpBat, sourceData.bat);
      fs2.writeFileSync(tmpManifest, sourceData.manifest);
    }
    return tmpBat;
  }
  function windowsSnapshot(options = {}) {
    return new Promise((resolve, reject) => {
      const displayName = options.screen;
      const format = options.format || "jpg";
      const tmpPath = temp2.path({
        suffix: `.${format}`
      });
      const imgPath = path.resolve(options.filename || tmpPath);
      const displayChoice = displayName ? ` /d "${displayName}"` : "";
      const tmpBat = copyToTemp();
      exec('"' + tmpBat + '" "' + imgPath + '" ' + displayChoice, {
        cwd: path.join(os.tmpdir(), "screenCapture"),
        windowsHide: true
      }, (err, stdout) => {
        if (err) {
          return reject(err);
        } else {
          if (options.filename) {
            resolve(imgPath);
          } else {
            readAndUnlinkP(tmpPath).then(resolve).catch(reject);
          }
        }
      });
    });
  }
  const EXAMPLE_DISPLAYS_OUTPUT = "\r\nC:\\Users\\devetry\\screenshot-desktop\\lib\\win32>//  2>nul  || \r\n\\.\\DISPLAY1;0;1920;1080;0\r\n\\.\\DISPLAY2;0;3840;1080;1920\r\n";
  function parseDisplaysOutput(output) {
    const displaysStartPattern = /2>nul {2}\|\| /;
    const {
      0: match,
      index
    } = displaysStartPattern.exec(output);
    return output.slice(index + match.length).split("\n").map((s) => s.replace(/[\n\r]/g, "")).map((s) => s.match(/(.*?);(.?\d+);(.?\d+);(.?\d+);(.?\d+);(.?\d*[\.,]?\d+)/)).filter((s) => s).map((m) => ({
      id: m[1],
      name: m[1],
      top: +m[2],
      right: +m[3],
      bottom: +m[4],
      left: +m[5],
      dpiScale: +m[6].replace(",", ".")
    })).map((d) => Object.assign(d, {
      height: d.bottom - d.top,
      width: d.right - d.left
    }));
  }
  function listDisplays() {
    return new Promise((resolve, reject) => {
      const tmpBat = copyToTemp();
      exec(
        '"' + tmpBat + '" /list',
        {
          cwd: path.join(os.tmpdir(), "screenCapture")
        },
        (err, stdout) => {
          if (err) {
            return reject(err);
          }
          resolve(parseDisplaysOutput(stdout));
        }
      );
    });
  }
  windowsSnapshot.listDisplays = listDisplays;
  windowsSnapshot.availableDisplays = listDisplays;
  windowsSnapshot.parseDisplaysOutput = parseDisplaysOutput;
  windowsSnapshot.EXAMPLE_DISPLAYS_OUTPUT = EXAMPLE_DISPLAYS_OUTPUT;
  windowsSnapshot.all = () => defaultAll(windowsSnapshot);
  win32 = windowsSnapshot;
  return win32;
}
if (process.platform === "linux") {
  screenshotDesktop.exports = requireLinux();
} else if (process.platform === "darwin") {
  screenshotDesktop.exports = requireDarwin();
} else if (process.platform === "win32") {
  screenshotDesktop.exports = requireWin32();
} else {
  screenshotDesktop.exports = function unSupported() {
    return Promise.reject(new Error("Currently unsupported platform. Pull requests welcome!"));
  };
}
var screenshotDesktopExports = screenshotDesktop.exports;
const screenshot = /* @__PURE__ */ getDefaultExportFromCjs(screenshotDesktopExports);
function handleScreenShot(captureWindow) {
  if (!captureWindow)
    return;
  captureWindow.webContents.send("start-capture");
  captureWindow.show();
}
async function getCaptureWindowSources(screenId) {
  try {
    return await screenshot({ screen: screenId, format: "png" });
  } catch (error) {
    console.error("getCaptureWindowSources is error");
  }
}
function handleSaveImageToClipboard(ImageDataURL) {
  const image = electron.nativeImage.createFromDataURL(ImageDataURL);
  electron.clipboard.writeImage(image);
}
async function handleDownloadImage(captureWindow, ImageDataURL) {
  try {
    if (!captureWindow)
      return false;
    const matches = ImageDataURL.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL");
    }
    const [, ext, base64Data] = matches;
    const buffer = Buffer.from(base64Data, "base64");
    const { filePath, canceled } = await electron.dialog.showSaveDialog(captureWindow, {
      title: "Download Image",
      defaultPath: `FengCh-${Date.now()}.${ext}`
    });
    if (canceled)
      return;
    await fs.writeFile(filePath, buffer);
  } catch (error) {
    console.error("handleDownloadImage is error");
  }
}
function getAllDisplays() {
  const screens = electron.screen.getAllDisplays();
  let screenDatas = [];
  screens.forEach((screen2) => {
    let tempScreenData = {
      id: screen2.id,
      label: screen2.label,
      size: screen2.size,
      bounds: screen2.bounds,
      scaleFactor: Math.ceil(screen2.scaleFactor)
    };
    screenDatas.push(tempScreenData);
  });
  return screenDatas;
}
const isDarwin = require$$3$1.platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
let createCaptureWindowProps;
let screenData;
let screenShotData;
let captureWindows = [];
let countOfCaptureWindowToShot = 0;
const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: require$$1.join(__dirname, "../dist-electron/preload.js")
    }
  });
  mainWindow.minimize();
  preloadCaptureWindows();
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(require$$1.join(__dirname, "../dist/index.html"));
  }
};
electron.app.whenReady().then(() => {
  init();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    electron.app.quit();
});
async function init() {
  await getScreenData();
  addEventListenerOfMain();
  createWindow();
  registerShortcut();
}
function getCaptureWindowById(id) {
  return captureWindows.find((captureWindow) => captureWindow.id === id);
}
async function getScreenData() {
  screenData = getAllDisplays();
  screenShotData = await screenshot.listDisplays();
  screenShotData.forEach((data) => {
    screenData.map((screenData2) => {
      if (isDarwin) {
        if (screenData2.label === data.name || screenData2.label === "内建视网膜显示器") {
          screenData2.id = data.id;
        }
      } else {
        const { width, height } = screenData2.bounds;
        if (data.width === void 0 || data.height === void 0 || data.dpiScale === void 0)
          return;
        if (width === data.width / data.dpiScale && height === data.height / data.dpiScale) {
          screenData2.scaleFactor = data.dpiScale;
          screenData2.id = data.id;
        }
      }
    });
  });
}
function closeCaptureWindows() {
  captureWindows.forEach((captureWindow) => captureWindow.close());
  captureWindows = [];
}
function startScreenShot() {
  captureWindows.forEach((captureWindow) => {
    handleScreenShot(captureWindow);
  });
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", () => {
    startScreenShot();
  });
  electron.ipcMain.handle("captureWindow:sources", async (event, screenId) => {
    return await getCaptureWindowSources(screenId);
  });
  electron.ipcMain.handle("window:close", () => {
    closeCaptureWindows();
    mainWindow == null ? void 0 : mainWindow.close();
    console.log("------> close allWindow success!");
  });
  electron.ipcMain.handle("captureWindow:close", async () => {
    closeCaptureWindows();
    preloadCaptureWindows();
    console.log("------> close captureWindow success!");
  });
  electron.ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("------> saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  electron.ipcMain.handle("download:image", async (event, id, ImageDataURL) => {
    try {
      const captureWindow = getCaptureWindowById(id);
      if (!captureWindow)
        return;
      await handleDownloadImage(captureWindow, ImageDataURL);
      console.log("------> download:image success!");
      preloadCaptureWindows();
    } catch (error) {
      console.error("download:image is error");
    }
  });
  electron.ipcMain.on("captureWindowShow:ready", () => {
    countOfCaptureWindowToShot++;
    if (countOfCaptureWindowToShot === captureWindows.length) {
      captureWindows.forEach((captureWindow) => {
        captureWindow.webContents.send("captureWindow:show");
      });
    }
  });
}
async function preloadCaptureWindows() {
  try {
    screenData.forEach(async (screenData2) => {
      createCaptureWindowProps = {
        isDarwin,
        x: screenData2.bounds.x,
        y: screenData2.bounds.y,
        screenWidth: screenData2.size.width,
        screenHeight: screenData2.size.height
      };
      const captureWindow = await createCaptureWindow(createCaptureWindowProps);
      captureWindow.webContents.send("transport-screen-and-window-data", JSON.stringify({ screenData: screenData2, captureWindowId: captureWindow.id }));
      captureWindows.push(captureWindow);
      countOfCaptureWindowToShot = 0;
    });
    console.log("------> preloadCaptureWindiow is success!");
  } catch (error) {
    console.error("------> preloadCaptureWindiow is error!");
  }
}
function registerShortcut() {
  if (require$$3$1.platform() === "darwin") {
    console.log("------> registerShotcut success!");
    electron.globalShortcut.register("Command+P", () => {
      if (countOfCaptureWindowToShot === captureWindows.length)
        return;
      startScreenShot();
    });
    electron.globalShortcut.register("Command+Shift+P", () => {
      closeCaptureWindows();
      preloadCaptureWindows();
    });
  } else {
    electron.globalShortcut.register("Ctrl+P", () => {
      startScreenShot();
    });
  }
  electron.globalShortcut.register("Esc", () => {
    closeCaptureWindows();
    preloadCaptureWindows();
  });
}
