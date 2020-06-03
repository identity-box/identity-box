"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IPNSPubSub = void 0;

var _utils = require("@identity-box/utils");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var IPNSPubSub = function IPNSPubSub() {
  _classCallCheck(this, IPNSPubSub);
};

exports.IPNSPubSub = IPNSPubSub;

_defineProperty(IPNSPubSub, "sendCommandToNameService", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (request) {
    var serviceProxy = new _utils.ServiceProxy('identity-box.nameservice');
    var response = yield serviceProxy.send(request);
    return response.response;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

_defineProperty(IPNSPubSub, "connect", function () {});

_defineProperty(IPNSPubSub, "setIPNSRecord", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (_ref2) {
    var ipnsName = _ref2.ipnsName,
        cid = _ref2.cid;
    var request = {
      method: 'publish-name',
      params: [{
        ipnsName: ipnsName,
        cid: cid
      }]
    };
    return IPNSPubSub.sendCommandToNameService(request);
  });

  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}());

_defineProperty(IPNSPubSub, "getCIDForIPNSName", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (_ref4) {
    var ipnsName = _ref4.ipnsName;
    var request = {
      method: 'resolve-name',
      params: [{
        ipnsName: ipnsName
      }]
    };
    return IPNSPubSub.sendCommandToNameService(request);
  });

  return function (_x3) {
    return _ref5.apply(this, arguments);
  };
}());

_defineProperty(IPNSPubSub, "deleteIPNSRecord", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(function* (_ref6) {
    var ipnsName = _ref6.ipnsName;
    var request = {
      method: 'unpublish-name',
      params: [{
        ipnsName: ipnsName
      }]
    };
    return IPNSPubSub.sendCommandToNameService(request);
  });

  return function (_x4) {
    return _ref7.apply(this, arguments);
  };
}());
//# sourceMappingURL=IPNSPubSub.js.map