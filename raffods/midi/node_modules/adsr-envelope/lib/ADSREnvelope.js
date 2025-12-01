"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ADSRParams = require("./ADSRParams");

var _ADSRParams2 = _interopRequireDefault(_ADSRParams);

var ADSREnvelope = (function () {
  function ADSREnvelope(opts) {
    _classCallCheck(this, ADSREnvelope);

    this._ = new _ADSRParams2["default"](opts);
  }

  _createClass(ADSREnvelope, [{
    key: "valueAt",
    value: function valueAt() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this._.valueAt(time);
    }
  }, {
    key: "applyTo",
    value: function applyTo(audioParam, playbackTime) {
      this.getWebAudioAPIMethods(playbackTime).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3);

        var method = _ref2[0];
        var value = _ref2[1];
        var time = _ref2[2];

        audioParam[method](value, time);
      });

      return this;
    }
  }, {
    key: "getWebAudioAPIMethods",
    value: function getWebAudioAPIMethods() {
      var playbackTime = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this._.methods(playbackTime);
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ADSREnvelope({
        attackTime: this._.attackTime,
        decayTime: this._.decayTime,
        sustainLevel: this._.sustainLevel,
        releaseTime: this._.releaseTime,
        gateTime: this._.gateTime,
        peakLevel: this._.peakLevel,
        epsilon: this._.epsilon,
        attackCurve: this._.attackCurve,
        decayCurve: this._.decayCurve,
        releaseCurve: this._.releaseCurve
      });
    }
  }, {
    key: "duration",
    set: function set(value) {
      this._.setDuration(value);
    },
    get: function get() {
      return this._.duration;
    }
  }, {
    key: "attackTime",
    set: function set(value) {
      this._.setAttackTime(value);
    },
    get: function get() {
      return this._.attackTime;
    }
  }, {
    key: "decayTime",
    set: function set(value) {
      this._.setDecayTime(value);
    },
    get: function get() {
      return this._.decayTime;
    }
  }, {
    key: "sustainTime",
    set: function set(value) {
      this._.setSustainTime(value);
    },
    get: function get() {
      return this._.sustainTime;
    }
  }, {
    key: "sustainLevel",
    set: function set(value) {
      this._.setSustainLevel(value);
    },
    get: function get() {
      return this._.sustainLevel;
    }
  }, {
    key: "releaseTime",
    set: function set(value) {
      this._.setReleaseTime(value);
    },
    get: function get() {
      return this._.releaseTime;
    }
  }, {
    key: "gateTime",
    set: function set(value) {
      this._.setGateTime(value);
    },
    get: function get() {
      return this._.gateTime;
    }
  }, {
    key: "peakLevel",
    set: function set(value) {
      this._.setPeakLevel(value);
    },
    get: function get() {
      return this._.peakLevel;
    }
  }, {
    key: "epsilon",
    set: function set(value) {
      this._.setEpsilon(value);
    },
    get: function get() {
      return this._.epsilon;
    }
  }, {
    key: "attackCurve",
    set: function set(value) {
      this._.setAttackCurve(value);
    },
    get: function get() {
      return this._.attackCurve;
    }
  }, {
    key: "decayCurve",
    set: function set(value) {
      this._.setDecayCurve(value);
    },
    get: function get() {
      return this._.decayCurve;
    }
  }, {
    key: "releaseCurve",
    set: function set(value) {
      this._.setReleaseCurve(value);
    },
    get: function get() {
      return this._.releaseCurve;
    }
  }]);

  return ADSREnvelope;
})();

exports["default"] = ADSREnvelope;
module.exports = exports["default"];