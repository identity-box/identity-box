"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntryPoint = void 0;

var _services = require("../services");

var _utils = require("@identity-box/utils");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EntryPoint = function EntryPoint(_ref) {
  var _this = this;

  var servicePath = _ref.servicePath,
      registrationPath = _ref.registrationPath;

  _classCallCheck(this, EntryPoint);

  _defineProperty(this, "identityService", void 0);

  _defineProperty(this, "servicePath", void 0);

  _defineProperty(this, "validateRegistrationResponse", function (response) {
    return response.method === 'register-response' && response.params.length === 1 && response.params[0].servicePath === _this.servicePath;
  });

  _defineProperty(this, "register", function () {
    var registrationRequest = {
      method: 'register',
      params: [{
        servicePath: _this.servicePath
      }]
    };
    var serviceProxy = new _utils.ServiceProxy(_this.registrationPath);
    return serviceProxy.send(registrationRequest);
  });

  _defineProperty(this, "start", /*#__PURE__*/_asyncToGenerator(function* () {
    var dispatcher = new _services.Dispatcher();
    _this.identityService = yield _services.IdentityService.create({
      servicePath: _this.servicePath,
      dispatcher: dispatcher
    });

    _services.IPNS.connect();

    if (_this.registrationPath) {
      var _ref3 = yield _this.register(),
          response = _ref3.response;

      if (_this.validateRegistrationResponse(response)) {
        console.log('registration successful');
      } else {
        console.log('registration failed!');
        console.log('received:');
        console.log(JSON.stringify(response));
      }
    }
  }));

  _defineProperty(this, "stop", function () {
    _this.identityService && _this.identityService.stop();
  });

  this.servicePath = servicePath;
  this.registrationPath = registrationPath;
};

exports.EntryPoint = EntryPoint;
//# sourceMappingURL=EntryPoint.js.map