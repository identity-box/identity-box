"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Dispatcher = void 0;

var _ipfsHttpClient = _interopRequireDefault(require("ipfs-http-client"));

var _IdentityProvider = require("./IdentityProvider");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Dispatcher = function Dispatcher() {
  var _this = this;

  _classCallCheck(this, Dispatcher);

  _defineProperty(this, "ipfs", (0, _ipfsHttpClient["default"])(process.env.IPFS_ADDR || '/ip4/127.0.0.1/tcp/5001'));

  _defineProperty(this, "identityProvider", void 0);

  _defineProperty(this, "dispatch", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (message) {
      console.log('**!!** DISPATCHER **!!**');
      console.log('received:');
      console.log('message:', message);

      switch (message.method) {
        case 'create-identity':
          return _this.identityProvider.createIdentity(message);

        case 'get-did-document':
          return _this.identityProvider.getDIDDocument(message);

        case 'store-json':
          return _this.identityProvider.storeJSON(message);

        case 'get-json':
          return _this.identityProvider.getJSON(message);

        case 'reset':
          return _this.identityProvider.reset(message);

        case 'backup':
          return _this.identityProvider.backup(message);

        case 'has-backup':
          return _this.identityProvider.hasBackup();

        case 'restore':
          return _this.identityProvider.restore(message);

        case 'delete':
          return _this.identityProvider.deleteIdentity(message);

        case 'migrate':
          return _this.identityProvider.migrate(message);

        default:
          return {
            method: 'unknown-method',
            params: []
          };
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  this.identityProvider = new _IdentityProvider.IdentityProvider(this.ipfs);
};

exports.Dispatcher = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map