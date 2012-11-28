var Dialog = require('./dialog');

var Auth = function(sdk) {
  this.storage = window.localStorage;
  this.sdk = sdk;
  this.options = sdk.options;
  this.token = this.storage.getItem('EP.accessToken');
  this.dialogOptions = {
      client_id: this.options.client_id
    , redirect_uri: this.options.redirect_uri
    , response_type:  "token"
    , scope: this.options.scope || "basic"
    , display: "popup"
    , window: this.options.window
    , retain: this.options.retain };
  this.dialogWindow = null;
}

var AuthPrototype = Auth.prototype;

AuthPrototype.accessToken = function(token) {
  if(token === undefined && this.token !== undefined) {
    return this.token;
  }
  if (token === null) {
    this.token = undefined;
    return this.storage.removeItem("EP.accessToken");
  } else if (token === undefined) {
    this.token = this.storage.getItem("EP.accessToken");
    return this.token;
  } else {
    this.token = token;
    return this.storage.setItem("EP.accessToken", token);
  }
}

AuthPrototype.connect = function(cb) {
  var self = this;
  if(this.connected()) {
    return cb(null, this.accessToken());
  }
  this.dialog = Dialog.dialog(this.sdk, 'Connect', this.dialogOptions, function(err, params) {
    if(err || params.error) {
      err = err || new Error("OAuth2 error:"+params.error+" description:"+params.error_description);
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

module.exports = Auth;