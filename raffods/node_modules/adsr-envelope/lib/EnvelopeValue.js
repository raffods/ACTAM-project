"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utilsLinlin = require("./utils/linlin");

var _utilsLinlin2 = _interopRequireDefault(_utilsLinlin);

var _utilsLinexp = require("./utils/linexp");

var _utilsLinexp2 = _interopRequireDefault(_utilsLinexp);

var _constants = require("./constants");

function at(envelope, time) {
  for (var i = 0, imax = envelope.length - 1; i < imax; i++) {
    var e0 = envelope[i];
    var e1 = envelope[i + 1];

    if (e0[_constants.TIME] <= time && time < e1[_constants.TIME]) {
      switch (e1[_constants.TYPE]) {
        case _constants.LIN:
          return (0, _utilsLinlin2["default"])(time, e0[_constants.TIME], e1[_constants.TIME], e0[_constants.VALUE], e1[_constants.VALUE]);
        case _constants.EXP:
          return (0, _utilsLinexp2["default"])(time, e0[_constants.TIME], e1[_constants.TIME], e0[_constants.VALUE], e1[_constants.VALUE]);
        default:
          return e0[_constants.VALUE];
      }
    }
  }

  return envelope.length ? envelope[envelope.length - 1][_constants.VALUE] : 0;
}

exports["default"] = { at: at };
module.exports = exports["default"];