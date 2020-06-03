"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = void 0;

var _entryPoint = require("./entry-point");

var _commander = _interopRequireDefault(require("commander"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var program = new _commander["default"].Command();

var start = function start(cmdObj) {
  var servicePath = cmdObj.servicePath,
      registrationPath = cmdObj.registrationPath;
  console.log('servicePath=', servicePath);
  console.log('registrationPath=', registrationPath);
  var entryPoint = new _entryPoint.EntryPoint({
    servicePath: servicePath,
    registrationPath: registrationPath
  });
  entryPoint.start();
  process.on('SIGINT', function () {
    console.log("stopping ".concat(servicePath, "..."));
    entryPoint.stop();
    console.log('stopped. exiting now...');
    process.exit(0);
  });
  process.stdin.resume();
};

var main = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    program.version('0.1.0').usage('command [options]').on('command:*', function () {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
      process.exit(1);
    });
    program.command('start').option('-p, --servicePath <path>', 'service path for the service in the format: service-namespace.service-id', 'identity-box.identity-service').option('-r, --registrationPath <path>', 'registration path for the service in the format: service-namespace.service-id', 'identity-box.service-registration').action(start);
    yield program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.help();
    }
  });

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

exports.main = main;
//# sourceMappingURL=main.js.map