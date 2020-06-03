"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IPNS = void 0;

var _IPNSPubSub = require("./IPNSPubSub");

var _IPNSFirebase = require("./IPNSFirebase");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ipns = _IPNSPubSub.IPNSPubSub;

var IPNS = function IPNS() {
  _classCallCheck(this, IPNS);
};

exports.IPNS = IPNS;

_defineProperty(IPNS, "use", function (ipnsInterfaceName) {
  switch (ipnsInterfaceName.toLowerCase()) {
    case 'firebase':
      ipns = _IPNSFirebase.IPNSFirebase;
      break;

    default:
      ipns = _IPNSPubSub.IPNSPubSub;
      break;
  }
});

_defineProperty(IPNS, "connect", function () {
  return ipns.connect();
});

_defineProperty(IPNS, "setIPNSRecord", function (_ref) {
  var ipnsName = _ref.ipnsName,
      cid = _ref.cid;
  return ipns.setIPNSRecord({
    ipnsName: ipnsName,
    cid: cid
  });
});

_defineProperty(IPNS, "getCIDForIPNSName", function (_ref2) {
  var ipnsName = _ref2.ipnsName;
  return ipns.getCIDForIPNSName({
    ipnsName: ipnsName
  });
});

_defineProperty(IPNS, "deleteIPNSRecord", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    var ipnsName = _ref3.ipnsName;
    return ipns.deleteIPNSRecord({
      ipnsName: ipnsName
    });
  });

  return function (_x) {
    return _ref4.apply(this, arguments);
  };
}());
//# sourceMappingURL=IPNS.js.map