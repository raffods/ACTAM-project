"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require("./constants");

function reduce(envelope) {
  envelope = envelope.filter(function (items) {
    return isFinite(items[_constants.TIME]);
  });

  var changed = undefined;

  do {
    changed = false;

    if (2 <= envelope.length) {
      var a = envelope[envelope.length - 2];
      var b = envelope[envelope.length - 1];

      if (a[_constants.VALUE] === b[_constants.VALUE]) {
        envelope.pop();
      }
    }

    for (var i = envelope.length - 2; i >= 0; i--) {
      var a = envelope[i];
      var b = envelope[i + 1];

      if (a[_constants.TYPE] === _constants.SET) {
        if (b[_constants.TYPE] !== _constants.SET) {
          if (a[_constants.VALUE] === b[_constants.VALUE] || a[_constants.TIME] === b[_constants.TIME]) {
            b[_constants.TYPE] = _constants.SET;
            changed = true;
          }
        } else if (a[_constants.TIME] === b[_constants.TIME]) {
          envelope.splice(i, 1);
          changed = true;
        }
      }
    }
  } while (changed && envelope.length);

  return envelope;
}

exports["default"] = { reduce: reduce };
module.exports = exports["default"];