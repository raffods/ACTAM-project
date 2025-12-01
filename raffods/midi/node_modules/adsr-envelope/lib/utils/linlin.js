"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = linlin;

function linlin(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

module.exports = exports["default"];