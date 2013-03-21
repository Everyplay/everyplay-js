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
    if(params.scope) {
      self.scope(params.scope);
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