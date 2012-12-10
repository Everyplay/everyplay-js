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

SDKPrototype.connect = function(cb) {
  return this.auth.connect(cb);
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

exports.connect = function(callback) {
  sdkSingleton.connect(callback);
};

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
