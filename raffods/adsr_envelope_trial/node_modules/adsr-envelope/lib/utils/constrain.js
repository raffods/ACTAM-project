"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = constrain;

function constrain(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}

module.exports = exports["default"];