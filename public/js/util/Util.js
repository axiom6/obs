var Util,
  indexOf = [].indexOf,
  hasProp = {}.hasOwnProperty;

Util = (function() {
  class Util {
    constructor() {
      Util.noop(Util.loadScript, Util.hasMethod, Util.dependsOn, Util.setInstance, Util.getInstance);
      Util.noop(Util.toError, Util.logJSON, Util.isNot, Util.isVal, Util.isntStr);
      Util.noop(Util.inIndex, Util.isEvent, Util.atArray, Util.atLength, Util.isStrInteger);
      Util.noop(Util.isStrCurrency, Util.isStrFloat, Util.isDefs, Util.toPosition, Util.xyScale);
      Util.noop(Util.resizeTimeout, Util.eventErrorCode, Util.toAlpha, Util.hashCode, Util.pdfCSS);
      Util.noop(Util.padStr, Util.isoDateTime, Util.toHMS, Util.toInt, Util.hex32);
      Util.noop(Util.toFloat, Util.toCap, Util.match_test, Util.svgId, Util.saveFile);
      Util.noop(Util.alert, Util.copyProperties, Util.clearHtmlIds, Util.parseURI, Util.unCap, Util.toObjects);
    }

    static element($elem) {
      // console.log( 'Dom.element()', $elem, Dom.isJQueryElem( $elem ) )
      if (Util.isJQueryElem($elem)) {
        return $elem.get(0);
      } else if (Util.isStr($elem)) {
        return $($elem).get(0);
      } else {
        console.error('Dom.domElement( $elem )', typeof $elem, $elem, '$elem is neither jQuery object nor selector');
        return $().get(0);
      }
    }

    static isJQueryElem($elem) {
      return (typeof $ !== "undefined" && $ !== null) && ($elem != null) && ($elem instanceof $ || indexOf.call(Object($elem), 'jquery') >= 0);
    }

    static loadScript(path, fn) {
      var head, script;
      head = document.getElementsByTagName('head')[0];
      script = document.createElement('script');
      script.src = path;
      script.async = false;
      if (Util.isFunc(fn)) {
        script.onload = fn;
      }
      head.appendChild(script);
    }

    static ready(fn) {
      if (!Util.isFunc(fn)) { // Sanity check
        return;
      } else if (Util.skipReady) {
        fn();
      } else if (document.readyState === 'complete') { // If document is already loaded, run method
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn, false);
      }
    }

    static isChild(key) {
      var a;
      a = key.charAt(0);
      return a === a.toUpperCase() && a !== '$';
    }

    // ---- Inquiry ----
    static hasMethod(obj, method, issue = false) {
      var has;
      has = typeof obj[method] === 'function';
      if (!has && issue) {
        console.log('Util.hasMethod()', method, has);
      }
      return has;
    }

    static hasGlobal(global, issue = true) {
      var has;
      has = window[global] != null;
      if (!has && issue) {
        console.error(`Util.hasGlobal() ${global} not present`);
      }
      return has;
    }

    static getGlobal(global, issue = true) {
      if (Util.hasGlobal(global, issue)) {
        return window[global];
      } else {
        return null;
      }
    }

    static hasModule(path, issue = true) {
      var has;
      has = Util.modules[path] != null;
      if (!has && issue) {
        console.error(`Util.hasModule() ${path} not present`);
      }
      return has;
    }

    static dependsOn() {
      var arg, has, j, len1, ok;
      ok = true;
      for (j = 0, len1 = arguments.length; j < len1; j++) {
        arg = arguments[j];
        has = Util.hasGlobal(arg, false) || Util.hasModule(arg, false) || Util.hasPlugin(arg, false);
        if (!has) {
          console.error('Missing Dependency', arg);
        }
        if (has === false) {
          ok = has;
        }
      }
      return ok;
    }

    // ---- Instances ----
    static setInstance(instance, path) {
      console.log('Util.setInstance()', path);
      if ((instance == null) && (path != null)) {
        console.error('Util.setInstance() instance not defined for path', path);
      } else if ((instance != null) && (path == null)) {
        console.error('Util.setInstance() path not defined for instance', instance.toString());
      } else {
        Util.instances[path] = instance;
      }
    }

    static getInstance(path, dbg = false) {
      var instance;
      if (dbg) {
        console.log('getInstance', path);
      }
      instance = Util.instances[path];
      if (instance == null) {
        console.error('Util.getInstance() instance not defined for path', path);
      }
      return instance;
    }

    // ---- Logging -------

    // args should be the arguments passed by the original calling function
    // This method should not be called directly
    static toStrArgs(prefix, args) {
      var arg, j, len1, str;
      Util.logStackNum = 0;
      str = Util.isStr(prefix) ? prefix + " " : "";
      for (j = 0, len1 = args.length; j < len1; j++) {
        arg = args[j];
        str += Util.toStr(arg) + " ";
      }
      return str;
    }

    static toStr(arg) {
      Util.logStackNum++;
      if (Util.logStackNum > Util.logStackMax) {
        return '';
      }
      switch (typeof arg) {
        case 'null':
          return 'null';
        case 'string':
          return Util.toStrStr(arg);
        case 'number':
          return arg.toString();
        case 'object':
          return Util.toStrObj(arg);
        default:
          return arg;
      }
    }

    // Recusively stringify arrays and objects
    static toStrObj(arg) {
      var a, j, key, len1, str, val;
      str = "";
      if (arg == null) {
        str += "null";
      } else if (Util.isArray(arg)) {
        str += "[ ";
        for (j = 0, len1 = arg.length; j < len1; j++) {
          a = arg[j];
          str += Util.toStr(a) + ",";
        }
        str = str.substr(0, str.length - 1) + " ]";
      } else if (Util.isObjEmpty(arg)) {
        str += "{}";
      } else {
        str += "{ ";
        for (key in arg) {
          if (!hasProp.call(arg, key)) continue;
          val = arg[key];
          str += key + ":" + Util.toStr(val) + ", ";
        }
        str = str.substr(0, str.length - 2) + " }"; // Removes last comma
      }
      return str;
    }

    static toStrStr(arg) {
      if (arg.length > 0) {
        return arg;
      } else {
        return '""';
      }
    }

    static toOut(obj, level = 0) {
      var ind, key, out, val;
      ind = Util.indent(level * 2);
      out = "";
      for (key in obj) {
        if (!hasProp.call(obj, key)) continue;
        val = obj[key];
        if (!(key.charAt(0) === key.charAt(0).toUpperCase())) {
          continue;
        }
        out += ind + key + '\n';
        if (Util.isObj(val)) {
          out += Util.toOut(val, level + 1);
        }
      }
      return out;
    }

    // Consume unused but mandated variable to pass code inspections
    static noop(...args) {
      if (false) {
        console.log(args);
      }
    }

    static toError() {
      var str;
      str = Util.toStrArgs('Error:', arguments);
      return new Error(str);
    }

    static alert() {
      var str;
      str = Util.toStrArgs('', arguments);
      console.log(str);
      alert(str);
    }

    static logJSON(json) {
      var obj;
      obj = JSON.parse(json);
      console.log(obj);
    }

    static jQueryHasNotBeenLoaded() {
      if (typeof jQuery === 'undefined') {
        console.error('Util JQuery has not been loaded');
        return true;
      } else {
        return false;
      }
    }

    // ------ Validators ------
    static isDef(d) {
      return d !== null && typeof d !== 'undefined';
    }

    static isNot(d) {
      return !Util.isDef(d);
    }

    static isStr(s) {
      return Util.isDef(s) && typeof s === "string" && s.length > 0;
    }

    static isntStr(s) {
      return !Util.isStr(s);
    }

    static isNum(n) {
      return !isNaN(n);
    }

    static isObj(o) {
      return Util.isDef(o) && typeof o === "object";
    }

    static isVal(v) {
      return typeof v === "number" || typeof v === "string" || typeof v === "boolean";
    }

    static isNaN(v) {
      return Util.isDef(v) && typeof v === "number" && Number.isNaN(v);
    }

    static isSym(v) {
      return typeof v === "symbol";
    }

    static isObjEmpty(o) {
      return Util.isObj(o) && Object.getOwnPropertyNames(o).length === 0;
    }

    static isFunc(f) {
      return Util.isDef(f) && typeof f === "function";
    }

    static isArray(a) {
      return Util.isDef(a) && typeof a !== "string" && (a.length != null) && a.length > 0;
    }

    static isEvent(e) {
      return Util.isDef(e) && (e.target != null);
    }

    static inIndex(a, i) {
      return Util.isArray(a) && 0 <= i && i < a.length;
    }

    static inArray(a, e) {
      return Util.isArray(a) && a.indexOf(e) > -1;
    }

    static atArray(a, e) {
      if (Util.inArray(a, e)) {
        return a.indexOf(e);
      } else {
        return -1;
      }
    }

    static inString(s, e) {
      return Util.isStr(s) && s.indexOf(e) > -1;
    }

    static atLength(a, n) {
      return Util.isArray(a) && a.length === n;
    }

    static head(a) {
      if (Util.isArray(a)) {
        return a[0];
      } else {
        return null;
      }
    }

    static tail(a) {
      if (Util.isArray(a)) {
        return a[a.length - 1];
      } else {
        return null;
      }
    }

    static time() {
      return new Date().getTime();
    }

    static isStrInteger(s) {
      return /^\s*(\+|-)?\d+\s*$/.test(s);
    }

    static isStrFloat(s) {
      return /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/.test(s);
    }

    static isStrCurrency(s) {
      return /^\s*(\+|-)?((\d+(\.\d\d)?)|(\.\d\d))\s*$/.test(s);
    }

    //@isStrEmail:(s)   -> /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/.test(s)
    static isDefs() {
      var arg, j, len1;
      for (j = 0, len1 = arguments.length; j < len1; j++) {
        arg = arguments[j];
        if (arg == null) {
          return false;
        }
      }
      return true;
    }

    static checkTypes(type, args) {
      var arg, key;
      for (key in args) {
        if (!hasProp.call(args, key)) continue;
        arg = args[key];
        // console.log( "Util.checkTypes isNum() argument #{key} is #{type}", arg, Util.isNum(arg) )
        if (!Util.checkType(type, arg)) {
          console.log(`Util.checkTypes(type,args) argument ${key} is not ${type}`, arg);
          console.trace();
        }
      }
    }

    static checkType(type, arg) {
      switch (type) {
        case "string":
          return Util.isStr(arg);
        case "number":
          return Util.isNum(arg);
        case "object":
          return Util.isObj(arg);
        case "symbol":
          return Util.isSym(arg);
        case "function":
          return Util.isFunc(arg);
        case "array":
          return Util.isArray(arg);
        default:
          return false;
      }
    }

    static copyProperties(to, from) {
      var key, val;
      for (key in from) {
        if (!hasProp.call(from, key)) continue;
        val = from[key];
        to[key] = val;
      }
      return to;
    }

    static contains(array, value) {
      return Util.isArray(array) && array.indexOf(value) !== -1;
    }

    // Screen absolute (left top width height) percent positioning and scaling

    // Percent array to position mapping
    static toPosition(array) {
      return {
        left: array[0],
        top: array[1],
        width: array[2],
        height: array[3]
      };
    }

    // Adds Percent from array for CSS position mapping
    static toPositionPc(array) {
      return {
        position: 'absolute',
        left: array[0] + '%',
        top: array[1] + '%',
        width: array[2] + '%',
        height: array[3] + '%'
      };
    }

    static xyScale(prev, next, port, land) {
      var xn, xp, xs, yn, yp, ys;
      xp = 0;
      yp = 0;
      xn = 0;
      yn = 0;
      [xp, yp] = prev.orientation === 'Portrait' ? [port[2], port[3]] : [land[2], land[3]];
      [xn, yn] = next.orientation === 'Portrait' ? [port[2], port[3]] : [land[2], land[3]];
      xs = next.width * xn / (prev.width * xp);
      ys = next.height * yn / (prev.height * yp);
      return [xs, ys];
    }

    // ----------------- Guarded jQuery dependent calls -----------------
    static resize(callback) {
      window.onresize = function() {
        return setTimeout(callback, 100);
      };
    }

    static resizeTimeout(callback, timeout = null) {
      window.onresize = function() {
        if (timeout != null) {
          clearTimeout(timeout);
        }
        return timeout = setTimeout(callback, 100);
      };
    }

    // ------ Html ------------
    static getHtmlId(name, type = '', ext = '') {
      var id;
      id = name + type + ext + Util.uniqueIdExt;
      return id.replace(/[ \.]/g, "");
    }

    static htmlId(name, type = '', ext = '', issueError = true) {
      var id;
      id = Util.getHtmlId(name, type, ext);
      if ((Util.htmlIds[id] != null) && issueError) {
        console.error('Util.htmlId() duplicate html id', id);
      }
      Util.htmlIds[id] = id;
      return id;
    }

    static clearHtmlIds() {
      return Util.htmlIds = {};
    }

    // ------ Converters ------
    static extend(obj, mixin) {
      var method, name;
      for (name in mixin) {
        if (!hasProp.call(mixin, name)) continue;
        method = mixin[name];
        obj[name] = method;
      }
      return obj;
    }

    static include(klass, mixin) {
      return Util.extend(klass.prototype, mixin);
    }

    static eventErrorCode(e) {
      var errorCode;
      errorCode = (e.target != null) && e.target.errorCode ? e.target.errorCode : 'unknown';
      return {
        errorCode: errorCode
      };
    }

    static toName(s1) {
      var s2, s3, s4, s5;
      if (s1 == null) {
        console.trace();
        return "???";
      }
      s2 = s1.replace('_', ' ');
      s3 = s2.replace(/([A-Z][a-z])/g, ' $1');
      s4 = s3.replace(/([A-Z]+)/g, ' $1');
      s5 = s4.replace(/([0-9][A-Z])/g, ' $1');
      return s5;
    }

    static toAlpha(s1) {
      return s1.replace(/\W/g, '');
    }

    static indent(n) {
      var i, j, ref, str;
      str = '';
      for (i = j = 0, ref = n; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        str += ' ';
      }
      return str;
    }

    static hashCode(str) {
      var hash, i, j, ref;
      hash = 0;
      for (i = j = 0, ref = str.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
      }
      return hash;
    }

    static lastTok(str, delim) {
      return str.split(delim).pop();
    }

    static firstTok(str, delim) {
      if (Util.isStr(str) && (str.split != null)) {
        return str.split(delim)[0];
      } else {
        console.error("Util.firstTok() str is not at string", str);
        return '';
      }
    }

    static pdfCSS(href) {
      var link;
      if (!window.location.search.match(/pdf/gi)) {
        return;
      }
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    /*
    parse = document.createElement('a')
    parse.href =  "http://example.com:3000/dir1/dir2/file.ext?search=test#hash"
    parse.protocol  "http:"
    parse.hostname  "example.com"
    parse.port      "3000"
    parse.pathname  "/dir1/dir2/file.ext"
    parse.segments  ['dir1','dir2','file.ext']
    parse.fileExt   ['file','ext']
    parse.file       'file'
    parse.ext        'ext'
    parse.search    "?search=test"
    parse.hash      "#hash"
    parse.host      "example.com:3000"
    */
    static parseURI(uri) {
      var a, j, len1, name, nameValue, nameValues, parse, value;
      parse = {};
      parse.params = {};
      a = document.createElement('a');
      a.href = uri;
      parse.href = a.href;
      parse.protocol = a.protocol;
      parse.hostname = a.hostname;
      parse.port = a.port;
      parse.segments = a.pathname.split('/');
      parse.fileExt = parse.segments.pop().split('.');
      parse.file = parse.fileExt[0];
      parse.ext = parse.fileExt.length === 2 ? parse.fileExt[1] : '';
      parse.dbName = parse.file;
      parse.fragment = a.hash;
      parse.query = Util.isStr(a.search) ? a.search.substring(1) : '';
      nameValues = parse.query.split('&');
      if (Util.isArray(nameValues)) {
        for (j = 0, len1 = nameValues.length; j < len1; j++) {
          nameValue = nameValues[j];
          name = '';
          value = '';
          [name, value] = nameValue.split('=');
          parse.params[name] = value;
        }
      }
      return parse;
    }

    static quicksort(array) {
      var a, head, large, small;
      if (array.length === 0) {
        return [];
      }
      head = array.pop();
      small = (function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = array.length; j < len1; j++) {
          a = array[j];
          if (a <= head) {
            results.push(a);
          }
        }
        return results;
      })();
      large = (function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = array.length; j < len1; j++) {
          a = array[j];
          if (a > head) {
            results.push(a);
          }
        }
        return results;
      })();
      return (Util.quicksort(small)).concat([head]).concat(Util.quicksort(large));
    }

    static pad(n) {
      if (n < 10) {
        return '0' + n;
      } else {
        return n;
      }
    }

    static padStr(n) {
      if (n < 10) {
        return '0' + n.toString();
      } else {
        return n.toString();
      }
    }

    // Return and ISO formated data string
    static isoDateTime(dateIn) {
      var date, pad;
      date = dateIn != null ? dateIn : new Date();
      console.log('Util.isoDatetime()', date);
      console.log('Util.isoDatetime()', date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes, date.getUTCSeconds);
      pad = function(n) {
        return Util.pad(n);
      };
      return date.getFullYear()(+'-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate()) + 'T' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes()) + ':' + pad(date.getUTCSeconds()) + 'Z');
    }

    static toHMS(unixTime) {
      var ampm, date, hour, min, sec, time;
      date = new Date();
      if (Util.isNum(unixTime)) {
        date.setTime(unixTime);
      }
      hour = date.getHours();
      ampm = 'AM';
      if (hour > 12) {
        hour = hour - 12;
        ampm = 'PM';
      }
      min = ('0' + date.getMinutes()).slice(-2);
      sec = ('0' + date.getSeconds()).slice(-2);
      time = `${hour}:${min}:${sec} ${ampm}`;
      return time;
    }

    // Generate four random hex digits
    static hex4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    // Generate a 32 bits hex
    static hex32() {
      var hex, i, j;
      hex = this.hex4();
      for (i = j = 1; j <= 4; i = ++j) {
        Util.noop(i);
        hex += this.hex4();
      }
      return hex;
    }

    // Return a number with fixed decimal places
    static toFixed(arg, dec = 2) {
      var num;
      num = (function() {
        switch (typeof arg) {
          case 'number':
            return arg;
          case 'string':
            return parseFloat(arg);
          default:
            return 0;
        }
      })();
      return num.toFixed(dec);
    }

    static toInt(arg) {
      switch (typeof arg) {
        case 'number':
          return Math.floor(arg);
        case 'string':
          return parseInt(arg);
        default:
          return 0;
      }
    }

    static toFloat(arg) {
      switch (typeof arg) {
        case 'number':
          return arg;
        case 'string':
          return parseFloat(arg);
        default:
          return 0;
      }
    }

    static toCap(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }

    static unCap(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    }

    static toArray(objects, whereIn = null, keyField = 'id') {
      var array, j, key, len1, object, where;
      where = whereIn != null ? whereIn : function() {
        return true;
      };
      array = [];
      if (Util.isArray(objects)) {
        for (j = 0, len1 = array.length; j < len1; j++) {
          object = array[j];
          if (!(where(object))) {
            continue;
          }
          if ((object['id'] != null) && keyField !== 'id') {
            object[keyField] = object['id'];
          }
          array.push(object);
        }
      } else {
        for (key in objects) {
          if (!hasProp.call(objects, key)) continue;
          object = objects[key];
          if (!(where(key, object))) {
            continue;
          }
          object[keyField] = key;
          array.push(object);
        }
      }
      return array;
    }

    static toObjects(rows, whereIn = null, keyField = 'id') {
      var j, key, len1, objects, row, where;
      where = whereIn != null ? whereIn : function() {
        return true;
      };
      objects = {};
      if (Util.isArray(rows)) {
        for (j = 0, len1 = rows.length; j < len1; j++) {
          row = rows[j];
          if (!(where(row))) {
            continue;
          }
          if ((row['id'] != null) && keyField !== 'id') {
            row[keyField] = row['id'];
          }
          objects[row[keyField]] = row;
        }
      } else {
        for (key in rows) {
          row = rows[key];
          if (!(where(row))) {
            continue;
          }
          row[keyField] = key;
          objects[key] = row;
        }
      }
      return objects;
    }

    static lenObject(object, where = function() {
        return true;
      }) {
      var key, len, obj;
      len = 0;
      for (key in object) {
        if (!hasProp.call(object, key)) continue;
        obj = object[key];
        if (where(key)) {
          len = len + 1;
        }
      }
      return len;
    }

    // Beautiful Code, Chapter 1.
    // Implements a regular expression matcher that supports character matches,
    // '.', '^', '$', and '*'.

    // Search for the regexp anywhere in the text.
    static match(regexp, text) {
      if (regexp[0] === '^') {
        return Util.match_here(regexp.slice(1), text);
      }
      while (text) {
        if (Util.match_here(regexp, text)) {
          return true;
        }
        text = text.slice(1);
      }
      return false;
    }

    // Search for the regexp at the beginning of the text.
    static match_here(regexp, text) {
      var cur, next;
      cur = "";
      next = "";
      [cur, next] = [regexp[0], regexp[1]];
      if (regexp.length === 0) {
        return true;
      }
      if (next === '*') {
        return Util.match_star(cur, regexp.slice(2), text);
      }
      if (cur === '$' && !next) {
        return text.length === 0;
      }
      if (text && (cur === '.' || cur === text[0])) {
        return Util.match_here(regexp.slice(1), text.slice(1));
      }
      return false;
    }

    // Search for a kleene star match at the beginning of the text.
    static match_star(c, regexp, text) {
      while (true) {
        if (Util.match_here(regexp, text)) {
          return true;
        }
        if (!(text && (text[0] === c || c === '.'))) {
          return false;
        }
        text = text.slice(1);
      }
    }

    static match_test() {
      console.log(Util.match_args("ex", "some text"));
      console.log(Util.match_args("s..t", "spit"));
      console.log(Util.match_args("^..t", "buttercup"));
      console.log(Util.match_args("i..$", "cherries"));
      console.log(Util.match_args("o*m", "vrooooommm!"));
      return console.log(Util.match_args("^hel*o$", "hellllllo"));
    }

    static match_args(regexp, text) {
      return console.log(regexp, text, Util.match(regexp, text));
    }

    static svgId(name, type, svgType, check = false) {
      if (check) {
        return this.id(name, type, svgType);
      } else {
        return name + type + svgType;
      }
    }

    static css(name, type = '') {
      return name + type;
    }

    static icon(name, type, fa) {
      return name + type + ' fa fa-' + fa;
    }

    // json - "application/json;charset=utf-8"
    // svg
    static mineType(fileType) {
      var mine;
      mine = (function() {
        switch (fileType) {
          case 'json':
            return "application/json";
          case 'adoc':
            return "text/plain";
          case 'html':
            return "text/html";
          case 'svg':
            return "image/svg+xml";
          default:
            return "text/plain";
        }
      })();
      mine += ";charset=utf-8";
      return mine;
    }

    static saveFile(stuff, fileName, fileType) {
      var blob, downloadLink, url;
      blob = new Blob([stuff], {
        type: this.mineType(fileType)
      });
      url = window['URL'].createObjectURL(blob);
      downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

  };

  Util.myVar = 'myVar';

  Util.skipReady = false;

  Util.isCommonJS = false;

  Util.isWebPack = false;

  Util.Load = null;

  Util.ModuleGlobals = [];

  Util.app = {};

  Util.testTrue = true;

  Util.debug = false;

  Util.message = false;

  Util.count = 0;

  Util.modules = [];

  Util.instances = [];

  Util.globalPaths = [];

  Util.root = '../../'; // Used internally

  Util.rootJS = Util.root + 'js/';

  Util.databases = {};

  Util.htmlIds = {}; // Object of unique Html Ids

  Util.logStackNum = 0;

  Util.logStackMax = 100;

  Util.fills = {};

  Util.uniqueIdExt = '';

  return Util;

}).call(this);

export default Util;
