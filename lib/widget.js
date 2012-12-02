var Emitter = require('emitter');
var qs = require('querystring');

function init (callback) {
  var self = this;
  makeCall.call(this, 'init', [], function () {
    self.emit(Widget.Events.READY);
  });
}

function initIFrame () {
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
      return;
    }

    var data = event.data;
    if (data.event_type) {
      self.emit.apply(self, [data.event_type].concat(data.args || []));
    } else if(data.callback_id !== undefined) {
      var args = data.args || [];
      var callback_id = data.callback_id;
      if (self._callbacks[callback_id]) {
        self._callbacks[callback_id].apply(self, args);
      }
    }
  }, false);
}

function makeCall(fn, args, callback) {
  if (callback) {
    var id = this._next_callback_id++;
    this._callbacks[id] = callback;
  }

  this._iframe.contentWindow.postMessage({
    fn: fn,
    args: args,
    callback_id: id
  }, this._iframe.src);
}

function createWidgetFunction (type, argsCount, hasCallback) {
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

var Widget = function(element) {
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
  LOAD_PROGRESS: "LOAD_PROGRESS"
  , PLAY_PROGRESS: "PLAY_PROGRESS"
  , PLAY: "PLAY"
  , PAUSE: "PAUSE"
  , FINISH: "FINISH"
  , SEEK: "SEEK"
  /*UI*/
  , READY: "READY"
  , CLICK_EXTERNAL: "CLICK_EXTERNAL"
  , OPEN_SHARE_PANEL: "OPEN_SHARE_PANEL"
  , SHARE: "SHARE"
};

module.exports = Widget;
