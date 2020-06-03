"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IPNSFirebase = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// for some reason this does not work!
// import * as admin from 'firebase-admin'
var admin = require('firebase-admin');

var IPNSFirebase = function IPNSFirebase() {
  _classCallCheck(this, IPNSFirebase);
};

exports.IPNSFirebase = IPNSFirebase;

_defineProperty(IPNSFirebase, "connect", function () {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://idbox-52fa6.firebaseio.com'
  });
});

_defineProperty(IPNSFirebase, "setIPNSRecord", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (_ref) {
    var ipnsName = _ref.ipnsName,
        cid = _ref.cid;
    var db = admin.firestore();
    var docRef = db.collection('ipns').doc(ipnsName);
    var writeResult = yield docRef.set({
      cid: cid
    });
    return writeResult.writeTime.toDate().toISOString();
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());

_defineProperty(IPNSFirebase, "getCIDForIPNSName", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    var ipnsName = _ref3.ipnsName;
    var db = admin.firestore();
    var docRef = db.collection('ipns').doc(ipnsName);
    var doc = yield docRef.get();

    if (!doc.exists) {
      console.log("No CID for IPNS name ".concat(ipnsName));
      return undefined;
    }

    var cid = doc.data().cid;
    return {
      ipnsName: ipnsName,
      cid: cid
    };
  });

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}());

_defineProperty(IPNSFirebase, "deleteIPNSRecord", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (_ref5) {
    var ipnsName = _ref5.ipnsName;
    var db = admin.firestore();
    var docRef = db.collection('ipns').doc(ipnsName);
    var doc = yield docRef.get();

    if (!doc.exists) {
      console.log("No CID for IPNS name ".concat(ipnsName));
      return;
    }

    yield docRef["delete"]();
  });

  return function (_x3) {
    return _ref6.apply(this, arguments);
  };
}());
//# sourceMappingURL=IPNSFirebase.js.map