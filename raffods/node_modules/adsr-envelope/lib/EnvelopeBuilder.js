"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _EnvelopeReducer = require("./EnvelopeReducer");

var _EnvelopeReducer2 = _interopRequireDefault(_EnvelopeReducer);

var _utilsLinlin = require("./utils/linlin");

var _utilsLinlin2 = _interopRequireDefault(_utilsLinlin);

var _utilsLinexp = require("./utils/linexp");

var _utilsLinexp2 = _interopRequireDefault(_utilsLinexp);

var _constants = require("./constants");

function build(params) {
  var envelope = buildEnvelope(params);

  envelope = _EnvelopeReducer2["default"].reduce(envelope);

  return envelope;
}

function getCurveItems(curveType, epsilon) {
  if (curveType === "exp") {
    return { zero: epsilon, calc: _utilsLinexp2["default"], type: _constants.EXP };
  }
  return { zero: 0, calc: _utilsLinlin2["default"], type: _constants.LIN };
}

function buildEnvelope(params) {
  var attackTime = params.attackTime;
  var decayTime = params.decayTime;
  var gateTime = params.gateTime;
  var releaseTime = params.releaseTime;

  var envType = 0;

  envType += 0 < attackTime ? 4 : 0;
  envType += 0 < decayTime ? 2 : 0;
  envType += 0 < releaseTime ? 1 : 0;

  switch (envType) {
    case 0:
      return buildSustainEnvelope(params);
    case 1:
      return buildSustainReleaseEnvelope(params);
    case 2:
      if (gateTime <= decayTime) {
        return buildDecayEnvelope(params);
      }
      return buildDecaySustainEnvelope(params);
    case 3:
      if (gateTime <= decayTime) {
        return buildDecayReleaseEnvelope(params);
      }
      return buildDecaySustainReleaseEnvelope(params);
    case 4:
      if (gateTime <= attackTime) {
        return buildAttackEnvelope(params);
      }
      return buildAttackSustainEnvelope(params);
    case 5:
      if (gateTime <= attackTime) {
        return buildAttackReleaseEnvelope(params);
      }
      return buildAttackSustainReleaseEnvelope(params);
    case 6:
      if (gateTime <= attackTime) {
        return buildAttackEnvelope(params);
      }
      if (gateTime <= attackTime + decayTime) {
        return buildAttackDecayEnvelope(params);
      }
      return buildAttackDecaySustainEnvelope(params);
    case 7:
      if (gateTime <= attackTime) {
        return buildAttackReleaseEnvelope(params);
      }
      if (gateTime <= attackTime + decayTime) {
        return buildAttackDecayReleaseEnvelope(params);
      }
      return buildAttackDecaySustainReleaseEnvelope(params);
    default:
    // do nothing
  }
}

function buildSustainEnvelope(params) {
  //
  //
  // ----------*
  //           |
  //           +---------
  // 0         12
  //
  var result = [];
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime;
  var v0 = params.sustainLevel * params.peakLevel;
  var v1 = params.sustainLevel * params.peakLevel;
  var v2 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([_constants.SET, v1, t1]);
  result.push([_constants.SET, v2, t2]);

  return result;
}

function buildSustainReleaseEnvelope(params) {
  //
  //
  // ----------*
  //            \
  //             +-------
  // 0         1 2
  var result = [];
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime + params.releaseTime;
  var v0 = Math.max(r.zero, params.sustainLevel * params.peakLevel);
  var v1 = Math.max(r.zero, params.sustainLevel * params.peakLevel);
  var v2 = r.zero;

  result.push([_constants.SET, v0, t0]);
  result.push([_constants.SET, v1, t1]);
  result.push([r.type, v2, t2]);

  return result;
}

function buildDecaySustainEnvelope(params) {
  // +
  //  \
  //   +-------*
  //           |
  //           +---------
  // 0 1       23
  var result = [];
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.decayTime;
  var t2 = params.gateTime;
  var t3 = params.gateTime;
  var v0 = Math.max(d.zero, params.peakLevel);
  var v1 = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v2 = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v3 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([d.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);
  result.push([_constants.SET, v3, t3]);

  return result;
}

function buildDecayEnvelope(params) {
  // +
  //  \
  //   *
  //   |
  //   +-----------------
  // 0 12
  var result = [];
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime;
  var v0 = Math.max(d.zero, params.peakLevel);
  var vx = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v1 = d.calc(t1, 0, params.decayTime, v0, vx);
  var v2 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([d.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);

  return result;
}

function buildDecaySustainReleaseEnvelope(params) {
  // +
  //  \
  //   +-------*
  //            \
  //             +-------
  // 0 1       2 3
  var result = [];
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.decayTime;
  var t2 = params.gateTime;
  var t3 = params.gateTime + params.releaseTime;
  var v0 = Math.max(d.zero, r.zero, params.peakLevel);
  var v1 = Math.max(d.zero, r.zero, params.sustainLevel * params.peakLevel);
  var v2 = Math.max(d.zero, r.zero, params.sustainLevel * params.peakLevel);
  var v3 = r.zero;

  result.push([_constants.SET, v0, t0]);
  result.push([d.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);
  result.push([r.type, v3, t3]);

  return result;
}

function buildDecayReleaseEnvelope(params) {
  // +
  //  \
  //   *
  //    \
  //     +---------------
  // 0 1 2
  var result = [];
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime + params.releaseTime;
  var v0 = Math.max(d.zero, r.zero, params.peakLevel);
  var vx = Math.max(d.zero, r.zero, params.sustainLevel * params.peakLevel);
  var v1 = d.calc(t1, 0, params.decayTime, v0, vx);
  var v2 = Math.max(d.zero, r.zero);

  result.push([_constants.SET, v0, t0]);
  result.push([d.type, v1, t1]);
  result.push([r.type, v2, t2]);

  return result;
}

function buildAttackSustainEnvelope(params) {
  //     +
  //    /|
  //   / +-----*
  //  /        |
  // +         +---------
  // 0   12    34
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.attackTime;
  var t3 = params.gateTime;
  var t4 = params.gateTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, params.peakLevel);
  var v2 = params.sustainLevel * params.peakLevel;
  var v3 = params.sustainLevel * params.peakLevel;
  var v4 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);
  result.push([_constants.SET, v3, t3]);
  result.push([_constants.SET, v4, t4]);

  return result;
}

function buildAttackEnvelope(params) {
  //
  //
  //   *
  //  /|
  // + +-----------------
  // 0 12
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime;
  var v0 = a.zero;
  var vx = Math.max(a.zero, params.peakLevel);
  var v1 = a.calc(t1, 0, params.attackTime, v0, vx);
  var v2 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);

  return result;
}

function buildAttackSustainReleaseEnvelope(params) {
  //     +
  //    /|
  //   / +-----*
  //  /         \
  // +           +-------
  // 0   12    3 4
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.attackTime;
  var t3 = params.gateTime;
  var t4 = params.gateTime + params.releaseTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, params.peakLevel);
  var v2 = Math.max(r.zero, params.sustainLevel * params.peakLevel);
  var v3 = Math.max(r.zero, params.sustainLevel * params.peakLevel);
  var v4 = r.zero;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([_constants.SET, v2, t2]);
  result.push([_constants.SET, v3, t3]);
  result.push([r.type, v4, t4]);

  return result;
}

function buildAttackReleaseEnvelope(params) {
  //
  //
  //   *
  //  / \
  // +   +---------------
  // 0 1 2
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.gateTime;
  var t2 = params.gateTime + params.releaseTime;
  var v0 = a.zero;
  var vx = Math.max(a.zero, params.peakLevel);
  var v1 = a.calc(t1, 0, params.attackTime, v0, vx);
  var v2 = r.zero;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([r.type, v2, t2]);

  return result;
}

function buildAttackDecaySustainEnvelope(params) {
  //     +
  //    / \
  //   /   +---*
  //  /        |
  // +         +---------
  // 0   1 2   34
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.attackTime + params.decayTime;
  var t3 = params.gateTime;
  var t4 = params.gateTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, d.zero, params.peakLevel);
  var v2 = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v3 = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v4 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([d.type, v2, t2]);
  result.push([_constants.SET, v3, t3]);
  result.push([_constants.SET, v4, t4]);

  return result;
}

function buildAttackDecayEnvelope(params) {
  //     +
  //    / \
  //   /   *
  //  /    |
  // +     +-------------
  // 0   1 23
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.gateTime;
  var t3 = params.gateTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, d.zero, params.peakLevel);
  var vx = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v2 = d.calc(t2, params.attackTime, params.attackTime + params.decayTime, v1, vx);
  var v3 = 0;

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([d.type, v2, t2]);
  result.push([_constants.SET, v3, t3]);

  return result;
}

function buildAttackDecaySustainReleaseEnvelope(params) {
  //     +
  //    / \
  //   /   +---*
  //  /         \
  // +           +-------
  // 0   1 2   3 4
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.attackTime + params.decayTime;
  var t3 = params.gateTime;
  var t4 = params.gateTime + params.releaseTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, d.zero, params.peakLevel);
  var v2 = Math.max(d.zero, r.zero, params.sustainLevel * params.peakLevel);
  var v3 = Math.max(d.zero, r.zero, params.sustainLevel * params.peakLevel);
  var v4 = Math.max(d.zero, r.zero);

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([d.type, v2, t2]);
  result.push([_constants.SET, v3, t3]);
  result.push([r.type, v4, t4]);

  return result;
}

function buildAttackDecayReleaseEnvelope(params) {
  //     +
  //    / \
  //   /   *
  //  /     \
  // +       +-----------
  // 0   1 2 3
  var result = [];
  var a = getCurveItems(params.attackCurve, params.epsilon);
  var d = getCurveItems(params.decayCurve, params.epsilon);
  var r = getCurveItems(params.releaseCurve, params.epsilon);
  var t0 = 0;
  var t1 = params.attackTime;
  var t2 = params.gateTime;
  var t3 = params.gateTime + params.releaseTime;
  var v0 = a.zero;
  var v1 = Math.max(a.zero, d.zero, params.peakLevel);
  var vx = Math.max(d.zero, params.sustainLevel * params.peakLevel);
  var v2 = d.calc(t2, params.attackTime, params.attackTime + params.decayTime, v1, vx);
  var v3 = Math.max(d.zero, r.zero);

  result.push([_constants.SET, v0, t0]);
  result.push([a.type, v1, t1]);
  result.push([d.type, v2, t2]);
  result.push([r.type, v3, t3]);

  return result;
}

exports["default"] = { build: build };
module.exports = exports["default"];