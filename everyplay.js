;(function(){
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-url/index.js", function(module, exports, require){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: a.port || location.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};
});
require.register("RedVentures-reduce/index.js", function(module, exports, require){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(xhr, options) {
  options = options || {};
  this.xhr = xhr;
  this.text = xhr.responseText;
  this.setStatusProperties(xhr.status);
  this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var msg = 'got ' + this.status + ' response';
  var err = new Error(msg);
  err.status = this.status;
  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.set('X-Requested-With', 'XMLHttpRequest');
  this.on('end', function(){
    var res = new Response(self.xhr);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Request.prototype = new Emitter;
Request.prototype.constructor = Request;

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("component-trim/index.js", function(module, exports, require){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-indexof/index.js", function(module, exports, require){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-inherit/index.js", function(module, exports, require){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("yields-merge/index.js", function(module, exports, require){

/**
 * merge `b`'s properties with `a`'s.
 *
 * example:
 *
 *        var user = {};
 *        merge(user, console);
 *        // > { log: fn, dir: fn ..}
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

module.exports = function (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

});
require.register("component-object/index.js", function(module, exports, require){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
});
require.register("everyplay-js/lib/sdk.js", function(module, exports, require){
/**
 * Module dependencies.
 */
var API = require('./api');
var Auth = require('./auth');
var Dialog = require('./dialog');
var Widget = require('./widget');


Dialog.handle();

var SDK = function(options) {
  options.base = options.base || "https://api.everyplay.com";
  options.site = options.site || "https://everyplay.com";
  options.namespace = options.namespace || '';
  this.options = options;
  this.client_id = options.client_id;
  if(!this.client_id) {
    throw new Error("client_id is requred.");
  }
  this.api = new API(this);
  this.auth = new Auth(this);
}

var SDKPrototype = SDK.prototype;

/**
 * Public interface.
 */
SDKPrototype.get = function(path, data, callback) {
  this.api.get(path, data, callback);
};

SDKPrototype.post = function(path, data, callback) {
  this.api.post(path, data, callback);
};

SDKPrototype.put = function(path, data, callback) {
  this.api.put(path, data, callback);
};

SDKPrototype.del = function(path, data, callback) {
  this.api.del(path, data, callback);
};

SDKPrototype.accessToken = function(token) {
  return this.auth.accessToken(token);
}

SDKPrototype.connect = function(options, cb) {
  return this.auth.connect(options, cb);
}
SDKPrototype.scope = function(scope) {
  return this.auth.scope(scope);
}
SDKPrototype.accessToken = function(token) {
  return this.auth.accessToken(token);
}

// everyplay can be used in a singleton manner by using the exports directly or using the SDK instance.
var sdkSingleton = null;

exports.initialize = function(options) {
  sdkSingleton = new SDK(options);
  return sdkSingleton;
};

exports.accessToken = function(token) {
  return sdkSingleton.accessToken(token);
}

exports.get = function(path, data, callback) {
  sdkSingleton.api.get(path, data, callback);
};

exports.post = function(path, data, callback) {
  sdkSingleton.api.post(path, data, callback);
};

exports.put = function(path, data, callback) {
  sdkSingleton.api.put(path, data, callback);
};

exports.del = function(path, data, callback) {
  sdkSingleton.api.del(path, data, callback);
};

exports.connect = function(options, callback) {
  sdkSingleton.connect(options, callback);
};

exports.scope = function(scope) {
  return sdkSingleton.scope(scope);
}

exports.dialog = function(name, options, callback) {
  return Dialog.dialog(name, options, callback);
};


exports.singleton = function(ep) {
  if(ep === undefined) {
    return sdkSingleton;
  }
  sdkSingleton = ep;
  return sdkSingleton;
};

exports.oEmbed = function() {

};


exports.Dialog = Dialog;
exports.Widget = Widget;

});
require.register("everyplay-js/lib/api.js", function(module, exports, require){

var URL = require('url');
var request = require('superagent');
var qs = require('querystring');
var object = require('object');
var everyplay = require('./sdk');

var API = function(sdk) {
  this.options = sdk.options;
  this.sdk = sdk;
  this.base = this.options.base;
};

var APIPrototype = API.prototype;

APIPrototype.get = function(path, data, callback) {
  this.apiRequest("GET", path, data, callback);
};

APIPrototype.post = function(path, data, callback) {
  this.apiRequest("POST", path, data, callback);
};

APIPrototype.put = function(path, data, callback) {
  this.apiRequest("PUT", path, data, callback);
};

APIPrototype.del = function(path, data, callback) {
  this.apiRequest("DELETE", path, data, callback);
};

APIPrototype.requestUrl = function(path, query) {
  if(URL.isRelative(path)) {
    path = this.base + path;
  }
  var loc = URL.parse(path);

  if(loc.query) {
    loc.query = qs.parse(loc.query);
  } else {
    loc.query = {};
  }
  query = query || {};
  Object.keys(query).forEach(function(key) {
    loc.query[key] = query[key];
  });

  var token = this.sdk.accessToken();
  if(!token && this.options.client_id) {
    loc.query['client_id'] = this.options.client_id;
  }
  console.log("Parsed api request url",loc);
  return loc;
}

APIPrototype.apiRequest = function(method, url, query, callback) {
  var data;
  if(!callback) {
    callback = query;
    query = {};
  }
  url = this.requestUrl(url, query);
  url.query.format = "json";
  data = url.query;
  url.query = {};
  var requestUrl = url.protocol + '//' + url.host + url.pathname;
  var req = request[method.toLowerCase()](requestUrl);
  if(method != "GET") {
    req.send(data)
  } else {
    req.query(data);
  }
  if(this.sdk.accessToken()) {
    req.set('Authorization', 'Bearer '+this.sdk.accessToken());
  }
  req.set('Accept','application/json');
  req.end(function(err, res) {
    if(!err && res.error) {
      err = new Error("HTTP Error "+res.status)
    }
    return callback(err, res.body);
  });
}

module.exports = API;
});
require.register("everyplay-js/lib/dialog.js", function(module, exports, require){
var URL = require('url');
var qs = require('querystring');
var inherit = require('inherit');
var merge = require('merge');

/**
 * Constants
 */
var PREFIX = "Everyplay_Dialog";

/**
 * Private methods
 */
function generateId() {
  return [PREFIX, Math.ceil(Math.random() * 1000000).toString(16)].join("_");
}

function openWindow(url, options) {
  options = options || {};
  options.url = url;
  options = merge(options, {
      location: url
    , left: window.screenX + (window.outerWidth  - options.width)  / 2
    , top: window.screenY + (window.outerHeight - options.height) / 2
    , scrollbars: "yes"
  });
  var opts = [];
  for(var i in options) {
    if(options.hasOwnProperty(i)) {
      opts.push(i+"="+options[i]);
    }
  }
  return window.open(url, options.name, opts.join(', '));
}

function getDialogFromWindow(window) {
  var loc = URL.parse(window.location.toString());
  loc.query = qs.parse(loc.query);
  if(loc.hash && loc.hash.length) {
    loc.hash = qs.parse(loc.hash.substring(1));
  }
  var id = loc.query.state || loc.hash.state;
  if(isDialogId(id)) {
    return id;
  }
  return null;
}

function isDialogId(id) {
  return (id || "").match (new RegExp("^"+PREFIX));
}

var Dialog = function(options, sdk) {
  if(typeof options == 'function') {
    callback = options;
    options = {};
  }
  this.params = [];
  this.sdk = sdk;
  this.options = sdk.options;
  this.dialogOptions = options;
  this.callback = options.callback;
  this.base = this.options.base;
  this.site = this.options.site;
  this.id = generateId();
}

var DialogPrototype = Dialog.prototype;



DialogPrototype.paramsFromWindow = function(window) {
  var params = {};
  var splitted = window.location.toString().split(/[&?#]/);
  if (splitted[0].match(/^http/)) {
    splitted.shift();
  }
  
  for (var i in splitted) {
    if (splitted.hasOwnProperty(i)) {
      var kv = splitted[i].split("=");
      if (kv[0]) {
        params[kv[0]] = decodeURIComponent(kv[1]);
      }
    }
  }

  return params;
}
/**
 * Executed in openers context
 *
 * @param window
 */
DialogPrototype.handleReturn = function(window) {
  var params = this.paramsFromWindow(this.dialogOptions.window);
  if(this.dialogOptions.window && !this.dialogOptions.retain) {
    this.dialogOptions.window.close();
  }
  if(this.callback) {
    return this.callback(params);
  }
}

DialogPrototype.url = function(path) {
  var self = this;
  if(URL.isRelative(path)) {
    path = this.options.base + path;
  }
  var query = {};
  this.params.forEach(function(key) {
    if(self.dialogOptions[key]) {
      query[key] = self.dialogOptions[key];
    }
  });
  query.state = this.id;
  path += '?'+qs.stringify(query);
  return path;
};

DialogPrototype.open = function() {
  var url = this.url(this.site + this.path);
  if(this.dialogOptions.display == "popup") {
    if(this.dialogOptions.window && !this.dialogOptions.window.closed) {
      this.dialogOptions.window.location = url;
    } else {
      this.dialogOptions.window = openWindow(url, this.dialogOptions);
    }
  } else {
    document.location.href = url;
  }
};

var FacebookDialog = function(options, sdk) {
  Dialog.call(this, options, sdk);
  this.name = "facebook";
  this.path = "/connect/facebook";
  this.dialogOptions.limited_token = 1;
  this.params = ["client_id","redirect_uri","state","response_type","scope","display", "limited_token"];
  this.dialogOptions.width = 320;
  this.dialogOptions.height = 480;
}

var TwitterDialog = function(options, sdk) {
  Dialog.call(this, options, sdk);
  this.name = "twitter";
  this.path = "/connect/twitter";
  this.dialogOptions.limited_token = 1;
  this.params = ["client_id","redirect_uri","state","response_type","scope","display", "limited_token"];
  this.dialogOptions.width = 550;
  this.dialogOptions.height = 480;
}

var GoogleDialog = function(options, sdk) {
  Dialog.call(this, options, sdk);
  this.name = "connect";
  this.path = "/connect/google";
  this.dialogOptions.limited_token = 1;
  this.params = ["client_id","redirect_uri","state","response_type","scope","display", "limited_token"];
  this.dialogOptions.width = 320;
  this.dialogOptions.height = 480;
}

var ConnectDialog = function(options, sdk) {
  Dialog.call(this, options, sdk);
  this.name = "connect";
  this.path = "/connect";
  this.params = ["client_id","redirect_uri","state","response_type","scope","display"];
  this.dialogOptions.width = 320;
  this.dialogOptions.height = 480;
}

ConnectDialogPrototype = ConnectDialog.prototype;


inherit(ConnectDialog, Dialog);
inherit(TwitterDialog, Dialog);
inherit(FacebookDialog, Dialog);
inherit(GoogleDialog, Dialog);

var dialogs = {};
exports.dialogs = {
  'connect': ConnectDialog,
  "facebook": FacebookDialog,
  "twitter": TwitterDialog,
  "google": GoogleDialog,
  "youtube": GoogleDialog
}

exports.dialog = function(sdk, name, options, callback) {
  options.callback = callback;
  var dialog = new exports.dialogs[name.toLowerCase()](options, sdk);
  dialogs[dialog.id] = dialog;
  dialog.open();
  return dialog;
};

/**
 * Called by this script every time it is loaded, handles any possible returns to parent window.
 */
exports.handle = function() {
  if((window.opener && window.opener.EP) || (window.top && window.top.EP)) {
    var id = getDialogFromWindow(window);
    if(id) {
      var ios = (navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i));
      if(ios) {
        window.opener.EP.Dialog.handleReturn(window);
      } else if(window.opener) {
        window.opener.setTimeout(function() {
          window.opener.EP.Dialog.handleReturn(window);
        }, 1);
      } else if(window.top) {
        window.top.setTimeout(function() {
          window.top.EP.Dialog.handleReturn(window);
        }, 1);
      }
    }
  }
}

exports.handleReturn = function(window) {
  var id = getDialogFromWindow(window);
  if(id) {
    var dialog = dialogs[id];
    if(dialog) {
      dialog.handleReturn();
      delete dialogs[id];
    }
  }
}





});
require.register("everyplay-js/lib/auth.js", function(module, exports, require){
var Dialog = require('./dialog');
var URL = require('url');
var qs = require('querystring');
var inherit = require('inherit');
var merge = require('merge');

var Auth = function(sdk) {
  this.storage = window.localStorage;
  this.sdk = sdk;
  this.options = sdk.options;
  this.namespace = sdk.options.namespace || '';
  this.token = this.accessToken();
  this.scopes = this.scope();

  this.dialogOptions = {
      client_id: this.options.client_id
    , redirect_uri: this.options.redirect_uri
    , response_type:  "token"
    , scope: this.options.scope || "basic"
    , display: this.options.display || "popup"
    , window: this.options.window
    , retain: this.options.retain };
  this.dialogWindow = null;

  var loc = URL.parse(window.location.toString());
  loc.query = qs.parse(loc.query);
  if(loc.hash && loc.hash.length) {
    loc.hash = qs.parse(loc.hash.substring(1));
  }
  if(loc.hash.scope) {
    this.scope(loc.hash.scope);
  }

  if(loc.hash.access_token) {
    this.accessToken(loc.hash.access_token);
    if(!window.opener || !window.opener.EP) {
      document.location.href = document.location.search;
    }
  }

}

var AuthPrototype = Auth.prototype;

AuthPrototype.accessToken = function(token) {
  if(token === undefined && this.token !== undefined) {
    return this.token;
  }
  if (token === null) {
    this.token = undefined;
    this.scope(null);
    return this.storage.removeItem(this.namespace+"EP.accessToken");
  } else if (token === undefined) {
    this.token = this.storage.getItem(this.namespace+"EP.accessToken");
    return this.token;
  } else {
    this.token = token;
    return this.storage.setItem(this.namespace+"EP.accessToken", token);
  }
}

AuthPrototype.connect = function(options, cb) {
  var self = this
    , dialogType = "connect";
  if(!cb) {
    cb = options;
    options = {};
  }
  if(this.connected()) {
    return cb(null, this.accessToken());
  }
  if(options.service) {
    dialogType = options.service;
  }
  this.dialog = Dialog.dialog(this.sdk, dialogType, merge(this.dialogOptions, options), function(params) {
    var err;

    if(params.error) {
      err = new Error("OAuth2 error:"+params.error+" description:"+params.error_description);
    }

    if(params.access_token) {
      self.accessToken(params.access_token);
    }
    return cb(err, self.accessToken());
  });
  this.dialogWindow = this.dialog.options.window;
};

AuthPrototype.connected = function() {
  return this.accessToken() != null;
}

AuthPrototype.scope = function(scopes) {
  if(scopes === undefined && this.scopes !== undefined) {
    return this.scopes;
  }
  if (scopes === null) {
    this.scopes = undefined;
    return this.storage.removeItem(this.namespace+"EP.scope");
  } else if (scopes === undefined) {
    this.scopes = this.storage.getItem(this.namespace+"EP.scope");
    return this.scopes;
  } else {
    this.scopes = scopes;
    return this.storage.setItem(this.namespace+"EP.scope", scopes);
  }
}

module.exports = Auth;
});
require.register("everyplay-js/lib/widget.js", function(module, exports, require){
var Emitter = require('emitter');
var qs = require('querystring');

function init(callback) {
  var self = this;
  makeCall.call(this, 'init', [], function () {
    self.emit(Widget.Events.READY);
  });
}

function initIFrame() {
  var self = this;
  if (this._iframe.src && this._iframe.src.length > 0) {
    this._iframe.onload = function () {
      init.call(self, function () {
        self._initialized = true;
      });
    }
  }

  window.addEventListener("message", function (event) {
    if (self._iframe.src.indexOf(event.origin) === -1) {
      //return;
    }

    var data = event.data;

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch(e) {}
    }


    if (data.event_type) {
      self.emit.apply(self, [data.event_type].concat(data.args || []));
    } else if (data.callback_id !== undefined) {
      var args = data.args || [];
      var callback_id = data.callback_id;
      if (self._callbacks[callback_id]) {
        self._callbacks[callback_id].apply(self, args);
      }
    }
  }, false);
}

function makeCall(fn, args, callback) {
  if (this._iframe == null) {
    return;
  }

  if (callback) {
    var id = this._next_callback_id++;
    this._callbacks[id] = callback;
  }

  this._iframe.contentWindow.postMessage(JSON.stringify({
    fn: fn,
    args: args,
    callback_id: id
  }), this._iframe.src);
}

function createWidgetFunction(type, argsCount, hasCallback) {
  return function () {
    var self = this;
    var args = Array.prototype.slice.call(arguments);

    function make() {
      makeCall.call(self, type, args.splice(0, argsCount), (hasCallback) ? args.pop() : null);
    }

    if (this._initialized) {
      make();
    } else {
      self.once(Widget.Events.READY, function () {
        make();
      });
    }
  }
}

var Widget = function (element) {
  Emitter.call(this);
  this._iframe = (typeof element === "string") ? document.getElementById(element) : element;
  this._next_callback_id = 0;
  this._callbacks = [];
  this._initialized = false;
  initIFrame.call(this);
};

var WidgetPrototype = Widget.prototype = new Emitter();
WidgetPrototype.constructor = Widget;


WidgetPrototype.load = createWidgetFunction("load", 2, false);

WidgetPrototype.play = createWidgetFunction("play", 0, false);
WidgetPrototype.pause = createWidgetFunction("pause", 0, false);
WidgetPrototype.seekTo = createWidgetFunction("seekTo", 1, false);
WidgetPrototype.next = createWidgetFunction("next", 0, false);
WidgetPrototype.prev = createWidgetFunction("prev", 0, false);
WidgetPrototype.skip = createWidgetFunction("skip", 1, false);
WidgetPrototype.toggle = createWidgetFunction("toggle");

/*Getters*/
WidgetPrototype.getVolume = createWidgetFunction("getVolume", 0, true);
WidgetPrototype.getDuration = createWidgetFunction("getDuration", 0, true);
WidgetPrototype.getPosition = createWidgetFunction("getPosition", 0, true);
WidgetPrototype.getVideos = createWidgetFunction("getVideos", 0, true);
WidgetPrototype.getCurrentVideo = createWidgetFunction("getCurrentVideo", 0, true);
WidgetPrototype.getCurrentVideoIndex = createWidgetFunction("getCurrentVideoIndex", 0, true);
WidgetPrototype.isPaused = createWidgetFunction("isPaused", 0, true);

Widget.Events = {
  /*PLAYER*/
  LOAD_PROGRESS: "LOAD_PROGRESS", PLAY_PROGRESS: "PLAY_PROGRESS", PLAY: "PLAY", PAUSE: "PAUSE", FINISH: "FINISH", SEEK: "SEEK"
  /*UI*/, READY: "READY", CLICK_EXTERNAL: "CLICK_EXTERNAL", OPEN_SHARE_PANEL: "OPEN_SHARE_PANEL", SHARE: "SHARE"
};

module.exports = Widget;

});
require.register("everyplay-js/lib/oembed.js", function(module, exports, require){


var oEmbed = function() {

}

module.exports = oEmbed;
});
require.alias("component-url/index.js", "everyplay-js/deps/url/index.js");

require.alias("visionmedia-superagent/lib/client.js", "everyplay-js/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "everyplay-js/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("component-querystring/index.js", "everyplay-js/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-emitter/index.js", "everyplay-js/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-inherit/index.js", "everyplay-js/deps/inherit/index.js");

require.alias("yields-merge/index.js", "everyplay-js/deps/merge/index.js");

require.alias("component-object/index.js", "everyplay-js/deps/object/index.js");

require.alias("everyplay-js/lib/sdk.js", "everyplay-js/index.js");
  if ("undefined" == typeof module) {
    window.EP = require("everyplay-js");
  } else {
    module.exports = require("everyplay-js");
  }
})();