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
  if(this.isDialogId(id)) {
    return id;
  }
  return null;
}

function isDialogId(id) {
  (id || "").match (new RegExp("^"+PREFIX));
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
  var loc = URL.parse(window.location.toString());
  loc.query = qs.parse(loc.query);
  if(loc.hash && loc.hash.length) {
    loc.hash = qs.parse(loc.hash.substring(1));
  }
  if(loc.hash) {
    params = merge(params, loc.hash);
  }
  if(loc.query) {
    params = merge(params, loc.query);
  }
  return params;
}
/**
 * Executed in openers context
 *
 * @param window
 */
DialogPrototype.handleReturn = function(window) {
  var params = this.paramsFromWindow();
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
  path += '?'+qs.stringify(query);
  return path;
};

DialogPrototype.open = function() {
  var url = this.url(this.site + this.path);
  if(this.dialogOptions.window) {
    this.dialogOptions.window.location = url;
  } else {
    this.dialogOptions.window = openWindow(url, this.dialogOptions);
  }
};

var ConnectDialog = function(options, sdk) {
  Dialog.call(this, options, sdk);
  this.name = "connect";
  this.path = "/connect";
  this.params = ["client_id","redirect_uri","state","response_type","scope","display"];
  this.dialogOptions.width = 320;
  this.dialogOptions.height = 480;
}

ConnectDialogPrototype = ConnectDialog.prototype;

ConnectDialogPrototype.buildURL = function() {

}

inherit(ConnectDialog, Dialog);

var dialogs = {};
exports.dialogs = {
  'Connect': ConnectDialog
}

exports.dialog = function(sdk, name, options, callback) {
  options.callback = callback;
  var dialog = new exports.dialogs[name](options, sdk);
  dialogs[dialog.id] = dialog;
  dialog.open();
  return dialog;
};

/**
 * Called by this script every time it is loaded, handles any possible returns to parent window.
 */
exports.handle = function() {
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




