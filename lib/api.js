
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