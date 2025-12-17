"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isFiniteNumber;

function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

module.exports = exports["default"];