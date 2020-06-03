"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdentityService = void 0;

var _utils = require("@identity-box/utils");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var IdentityService = function IdentityService(_ref) {
  var _this = this;

  var servicePath = _ref.servicePath,
      dispatcher = _ref.dispatcher;

  _classCallCheck(this, IdentityService);

  _defineProperty(this, "serviceRegistry", void 0);

  _defineProperty(this, "start", function () {
    return _utils.Service.create({
      servicePath: _this.servicePath,
      onMessage: _this.onMessage
    });
  });

  _defineProperty(this, "onMessage", /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (_ref2) {
      var method = _ref2.method,
          params = _ref2.params;

      try {
        return _this.dispatcher.dispatch({
          method: method,
          params: params
        });
      } catch (e) {
        return _this.errorResponse(method, e.message);
      }
    });

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }());

  _defineProperty(this, "errorResponse", function (method, message) {
    return {
      method: "".concat(method, "-error"),
      params: [{
        message: message
      }]
    };
  });

  this.servicePath = servicePath;
  this.dispatcher = dispatcher;
};

exports.IdentityService = IdentityService;

_defineProperty(IdentityService, "create", function (_ref4) {
  var servicePath = _ref4.servicePath,
      dispatcher = _ref4.dispatcher;

  if (!dispatcher) {
    throw new Error("Can't do anything without Dispatcher instance!");
  }

  var server = new IdentityService({
    servicePath: servicePath,
    dispatcher: dispatcher
  });
  return server.start();
});
//# sourceMappingURL=IdentityService.js.map