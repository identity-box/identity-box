"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdentityProvider = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _glob = _interopRequireDefault(require("glob"));

var _libp2pCrypto = _interopRequireDefault(require("libp2p-crypto"));

var _ipns = require("./ipns");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var IdentityProvider = function IdentityProvider(ipfs) {
  var _this = this;

  _classCallCheck(this, IdentityProvider);

  _defineProperty(this, "password", process.env.IDBOX_BACKUP_PASSWORD);

  _defineProperty(this, "ipfs", void 0);

  _defineProperty(this, "id", void 0);

  _defineProperty(this, "createIdentity", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (message) {
      var identity = yield _this.createNew(message.params[0]);

      var didDoc = _this.createDIDDocument(_objectSpread({}, identity, {}, message.params[0]));

      var cid = yield _this.writeToIPFS(didDoc);
      yield _this.pin(cid);
      console.log('cid:', cid);

      var ipnsName = _this.ipnsNameFromDID(identity.did);

      console.log('ipns name:', ipnsName);
      yield _ipns.IPNS.setIPNSRecord({
        ipnsName: ipnsName,
        cid: cid
      });
      return {
        method: 'create-identity-response',
        params: [{
          identity: identity
        }]
      };
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "getDIDDocument", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (message) {
      var did = message.params[0].did;

      var ipnsName = _this.ipnsNameFromDID(did);

      var _ref3 = yield _ipns.IPNS.getCIDForIPNSName({
        ipnsName: ipnsName
      }),
          cid = _ref3.cid;

      var didDocument = yield _this.readFromIPFS(cid);
      return {
        method: 'get-did-document-response',
        params: [didDocument]
      };
    });

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "storeJSON", /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* (message) {
      var json = message.params[0];
      var cid = yield _this.writeToIPFS(json);
      yield _this.pin(cid);
      return {
        method: 'store-json-response',
        params: [{
          cid: cid
        }]
      };
    });

    return function (_x3) {
      return _ref4.apply(this, arguments);
    };
  }());

  _defineProperty(this, "getJSON", /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* (message) {
      var cid = message.params[0].cid;

      var _ref6 = yield _this.readFromIPFS(cid),
          json = _ref6.json;

      return {
        method: 'get-json-response',
        params: [{
          json: json
        }]
      };
    });

    return function (_x4) {
      return _ref5.apply(this, arguments);
    };
  }());

  _defineProperty(this, "reset", /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(function* (message) {
      var identityNames = message.params[0].identityNames;
      yield _this.deleteAll(identityNames);
      return {
        method: 'reset-response'
      };
    });

    return function (_x5) {
      return _ref7.apply(this, arguments);
    };
  }());

  _defineProperty(this, "backup", /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(function* (message) {
      var _message$params$ = message.params[0],
          encryptedBackup = _message$params$.encryptedBackup,
          backupId = _message$params$.backupId,
          identityNames = _message$params$.identityNames;

      _this.createBackupFolders(backupId);

      _this.backupIds(encryptedBackup, backupId);

      var allKeys = yield _this.ipfs.key.list();
      var keys = allKeys.filter(function (k) {
        return identityNames.includes(k.name);
      });
      yield Promise.all(keys.map( /*#__PURE__*/function () {
        var _ref10 = _asyncToGenerator(function* (_ref9) {
          var name = _ref9.name,
              id = _ref9.id;
          if (name === 'self') return;
          console.log('backing up key: ', name);
          yield _this.backupName(name, backupId);
          yield _this.backupDIDDocument(id, backupId);
        });

        return function (_x7) {
          return _ref10.apply(this, arguments);
        };
      }()));
      return {
        method: 'backup-response'
      };
    });

    return function (_x6) {
      return _ref8.apply(this, arguments);
    };
  }());

  _defineProperty(this, "hasBackup", function () {
    var backupFiles = _glob["default"].sync('*', {
      cwd: process.env.IDBOX_BACKUP
    });

    var backupPresent = backupFiles.length > 0;
    return {
      method: 'has-backup-response',
      params: [{
        hasBackup: backupPresent
      }]
    };
  });

  _defineProperty(this, "restore", /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator(function* (message) {
      var backupId = message.params[0].backupId;
      var encryptedBackup;

      if (_this.backupExists(backupId)) {
        encryptedBackup = _this.restoreIds(backupId);
        yield _this.restoreNames(backupId);
        yield _this.restoreDIDDocuments(backupId);
      } else {
        encryptedBackup = 'not found';
      }

      return {
        method: 'restore-response',
        params: [{
          encryptedBackup: encryptedBackup
        }]
      };
    });

    return function (_x8) {
      return _ref11.apply(this, arguments);
    };
  }());

  _defineProperty(this, "deleteIdentity", /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator(function* (message) {
      var name = message.params[0].identityName;
      var allKeys = yield _this.ipfs.key.list();
      var keys = allKeys.filter(function (k) {
        return k.name === name;
      });

      if (keys.length === 1) {
        var ipnsName = keys[0].id;
        console.log("deleting key ".concat(name, " with IPNS name ").concat(ipnsName));
        yield _ipns.IPNS.deleteIPNSRecord({
          ipnsName: ipnsName
        });
        yield _this.ipfs.key.rm(name);
      }

      return {
        method: 'delete-response'
      };
    });

    return function (_x9) {
      return _ref12.apply(this, arguments);
    };
  }());

  _defineProperty(this, "migrate", /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator(function* (message) {
      var migration = message.params[0].migration;

      switch (migration.migrationType) {
        case 'KEY-NAMING':
          yield _this.migrateKeyNames(migration.migrationData);
          break;

        default:
          console.log('unknown migration - ignoring!');
      }

      return {
        method: 'migrate-response'
      };
    });

    return function (_x10) {
      return _ref13.apply(this, arguments);
    };
  }());

  _defineProperty(this, "createNew", /*#__PURE__*/function () {
    var _ref15 = _asyncToGenerator(function* (_ref14) {
      var name = _ref14.name,
          publicEncryptionKey = _ref14.publicEncryptionKey,
          publicSigningKey = _ref14.publicSigningKey;
      console.log('-------------------------------------------');
      console.log('creating identity:');
      console.log('name:', name);
      console.log('publicEncryptionKey:', publicEncryptionKey);
      console.log('publicSigningKey:', publicSigningKey);
      console.log('-------------------------------------------');
      _this.id = yield _this.ipfs.key.gen(name, {
        type: 'rsa',
        size: 2048
      });
      return {
        did: "did:ipid:".concat(_this.id.id),
        name: _this.id.name
      };
    });

    return function (_x11) {
      return _ref15.apply(this, arguments);
    };
  }());

  _defineProperty(this, "createDIDDocument", function (_ref16) {
    var did = _ref16.did,
        publicEncryptionKey = _ref16.publicEncryptionKey,
        publicSigningKey = _ref16.publicSigningKey;
    var timestamp = new Date().toISOString();
    return {
      '@context': {
        '/': 'zdpuAmoZixxJjvosviGeYcqduzDhSwGV2bL6ZTTXo1hbEJHfq'
      },
      created: timestamp,
      id: did,
      publicKey: [{
        id: "".concat(did, "#signing-key-1"),
        type: 'EdDsaPublicKey',
        controller: did,
        curve: 'ed25519',
        publicKeyBase64: publicSigningKey
      }, {
        id: "".concat(did, "#encryption-key-1"),
        type: 'ECDHPublicKey',
        controller: did,
        curve: 'Curve25519',
        publicKeyBase64: publicEncryptionKey
      }]
    };
  });

  _defineProperty(this, "writeToIPFS", /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator(function* (json) {
      var cid = yield _this.ipfs.dag.put(json, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      });
      return cid.toBaseEncodedString();
    });

    return function (_x12) {
      return _ref17.apply(this, arguments);
    };
  }());

  _defineProperty(this, "pin", /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator(function* (hash) {
      yield _this.ipfs.pin.add(hash);
    });

    return function (_x13) {
      return _ref18.apply(this, arguments);
    };
  }());

  _defineProperty(this, "readFromIPFS", /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator(function* (cid) {
      var _ref20 = yield _this.ipfs.dag.get(cid),
          value = _ref20.value;

      return value;
    });

    return function (_x14) {
      return _ref19.apply(this, arguments);
    };
  }());

  _defineProperty(this, "ipnsNameFromDID", function (did) {
    var match = did.match(/did:ipid:(.*)$/);
    return match && match[1];
  });

  _defineProperty(this, "deleteAll", /*#__PURE__*/function () {
    var _ref21 = _asyncToGenerator(function* (identityNames) {
      var allKeys = yield _this.ipfs.key.list();
      var keys = allKeys.filter(function (k) {
        return identityNames.includes(k.name);
      });
      yield Promise.all(keys.map( /*#__PURE__*/function () {
        var _ref23 = _asyncToGenerator(function* (_ref22) {
          var name = _ref22.name;
          if (name === 'self') return;
          console.log('deleting key: ', name);
          yield _this.ipfs.key.rm(name);
        });

        return function (_x16) {
          return _ref23.apply(this, arguments);
        };
      }())); // Currently we just unpublish the names but in the future we may decide
      // to have an apart user action to remove "old" identities.
      // When we deleteIPNS record, the corresponding identity will
      // not be "resolvable" anymore. This may not alwys be intented as
      // sometimes you may just reset your box, but you do not want
      // your identities to become "unavailbale" in the meantime.

      yield Promise.all(keys.map( /*#__PURE__*/function () {
        var _ref25 = _asyncToGenerator(function* (_ref24) {
          var ipnsName = _ref24.id,
              name = _ref24.name;
          if (name === 'self') return;
          console.log('deleting IPNS name: ', ipnsName);
          yield _ipns.IPNS.deleteIPNSRecord({
            ipnsName: ipnsName
          });
        });

        return function (_x17) {
          return _ref25.apply(this, arguments);
        };
      }()));
    });

    return function (_x15) {
      return _ref21.apply(this, arguments);
    };
  }());

  _defineProperty(this, "getKeyPath", function (name) {
    return _path["default"].join(process.env.IPFS_PATH, 'keystore', name);
  });

  _defineProperty(this, "getBackupPath", function (name, backupId) {
    return _path["default"].join(process.env.IDBOX_BACKUP, backupId, "".concat(name, ".pem"));
  });

  _defineProperty(this, "getBackupFolderPath", function (backupId) {
    return _path["default"].join(process.env.IDBOX_BACKUP, backupId, 'did-docs');
  });

  _defineProperty(this, "getDIDDocumentPath", function (backupId, ipnsName) {
    return _path["default"].join(process.env.IDBOX_BACKUP, backupId, 'did-docs', ipnsName);
  });

  _defineProperty(this, "exportPEM", /*#__PURE__*/function () {
    var _ref26 = _asyncToGenerator(function* (name) {
      var buf = _fs["default"].readFileSync(_this.getKeyPath(name));

      var key = yield _libp2pCrypto["default"].keys.unmarshalPrivateKey(buf);
      var pem = yield key["export"](_this.password);
      return pem;
    });

    return function (_x18) {
      return _ref26.apply(this, arguments);
    };
  }());

  _defineProperty(this, "importPEM", /*#__PURE__*/function () {
    var _ref27 = _asyncToGenerator(function* (name, pem) {
      var key = yield _libp2pCrypto["default"].keys["import"](pem, _this.password);
      var buf = yield _libp2pCrypto["default"].keys.marshalPrivateKey(key);

      _fs["default"].writeFileSync(_this.getKeyPath(name), buf, {
        mode: 420
      });
    });

    return function (_x19, _x20) {
      return _ref27.apply(this, arguments);
    };
  }());

  _defineProperty(this, "backupName", /*#__PURE__*/function () {
    var _ref28 = _asyncToGenerator(function* (name, backupId) {
      var pem = yield _this.exportPEM(name);

      _fs["default"].writeFileSync(_this.getBackupPath(name, backupId), pem, {
        mode: 420
      });
    });

    return function (_x21, _x22) {
      return _ref28.apply(this, arguments);
    };
  }());

  _defineProperty(this, "backupDIDDocument", /*#__PURE__*/function () {
    var _ref29 = _asyncToGenerator(function* (ipnsName, backupId) {
      var _ref30 = yield _ipns.IPNS.getCIDForIPNSName({
        ipnsName: ipnsName
      }),
          cid = _ref30.cid;

      var didDocument = yield _this.readFromIPFS(cid);

      _fs["default"].writeFileSync(_this.getDIDDocumentPath(backupId, ipnsName), JSON.stringify(didDocument), {
        mode: 420
      });
    });

    return function (_x23, _x24) {
      return _ref29.apply(this, arguments);
    };
  }());

  _defineProperty(this, "backupIds", function (encryptedBackup, backupId) {
    var backupPath = _path["default"].join(process.env.IDBOX_BACKUP, backupId, 'backup');

    _fs["default"].writeFileSync(backupPath, encryptedBackup, {
      mode: 420
    });
  });

  _defineProperty(this, "createBackupFolders", function (backupId) {
    _fs["default"].rmdirSync(_path["default"].join(process.env.IDBOX_BACKUP, backupId), {
      recursive: true
    });

    _fs["default"].mkdirSync(_this.getBackupFolderPath(backupId), {
      recursive: true,
      mode: 493
    });
  });

  _defineProperty(this, "restoreIds", function (backupId) {
    var backupPath = _path["default"].join(process.env.IDBOX_BACKUP, backupId, 'backup');

    return _fs["default"].readFileSync(backupPath, 'utf8');
  });

  _defineProperty(this, "restoreDIDDocuments", /*#__PURE__*/function () {
    var _ref31 = _asyncToGenerator(function* (backupId) {
      var ipnsNames = _glob["default"].sync('*', {
        cwd: _this.getBackupFolderPath(backupId)
      });

      yield Promise.all(ipnsNames.map( /*#__PURE__*/function () {
        var _ref32 = _asyncToGenerator(function* (ipnsName) {
          var didDoc = JSON.parse(_fs["default"].readFileSync(_this.getDIDDocumentPath(backupId, ipnsName), 'utf8'));
          var cid = yield _this.writeToIPFS(didDoc);
          console.log("restoring DIDDocument with IPNS name ".concat(ipnsName, " and CID ").concat(cid));
          yield _this.pin(cid);
          yield _ipns.IPNS.setIPNSRecord({
            ipnsName: ipnsName,
            cid: cid
          });
        });

        return function (_x26) {
          return _ref32.apply(this, arguments);
        };
      }()));
    });

    return function (_x25) {
      return _ref31.apply(this, arguments);
    };
  }());

  _defineProperty(this, "restoreNames", /*#__PURE__*/function () {
    var _ref33 = _asyncToGenerator(function* (backupId) {
      var pems = _glob["default"].sync('*.pem', {
        cwd: _path["default"].join(process.env.IDBOX_BACKUP, backupId)
      });

      yield Promise.all(pems.map( /*#__PURE__*/function () {
        var _ref34 = _asyncToGenerator(function* (pemFileName) {
          var name = pemFileName.replace(/\.pem$/, '');

          var pem = _fs["default"].readFileSync(_this.getBackupPath(name, backupId), 'utf8');

          yield _this.importPEM(name, pem);
        });

        return function (_x28) {
          return _ref34.apply(this, arguments);
        };
      }()));
    });

    return function (_x27) {
      return _ref33.apply(this, arguments);
    };
  }());

  _defineProperty(this, "backupExists", function (backupId) {
    return _fs["default"].existsSync(_path["default"].join(process.env.IDBOX_BACKUP, backupId));
  });

  _defineProperty(this, "migrateKeyNames", /*#__PURE__*/function () {
    var _ref35 = _asyncToGenerator(function* (migrationData) {
      console.log('migrationData=', migrationData);
      yield Promise.all(migrationData.map( /*#__PURE__*/function () {
        var _ref37 = _asyncToGenerator(function* (_ref36) {
          var oldName = _ref36.oldName,
              newName = _ref36.newName;
          yield _this.ipfs.key.rename(oldName, newName);
        });

        return function (_x30) {
          return _ref37.apply(this, arguments);
        };
      }()));
    });

    return function (_x29) {
      return _ref35.apply(this, arguments);
    };
  }());

  this.ipfs = ipfs;
};

exports.IdentityProvider = IdentityProvider;
//# sourceMappingURL=IdentityProvider.js.map