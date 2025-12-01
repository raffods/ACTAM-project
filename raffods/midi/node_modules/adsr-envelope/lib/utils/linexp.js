"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = linexp;

function linexp(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, (value - inMin) / (inMax - inMin)) * outMin;
}

module.exports = exports["default"];