# Name Service

A service to handle name resolution requests in a fully distributed way.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir nameservice
$ cd nameservice
$ yarn set version berry
$ echo 'nodeLinker: node-modules' >> .yarnrc.yml
$ yarn init
$ yarn add @identity-box/nameservice
```
## IPFS

Make sure the IPFS daemon is running:

```bash
$ ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate
```

## Required environment variables

Name Service assume some environment variables to be set.

### IPFS_ADDR

`IPFS_ADDR` contains the address of the IPFS host. This needs to conform to the
[multiaddr](https://multiformats.io/multiaddr/) format. When this environment
variable is not set, the address will default to `/ip4/127.0.0.1/tcp/5001`.

## Usage

To directly run the service, use:

```bash
$ yarn nameservice start
```

All currently published identities are listed in the `Identities.json` file. This allows the Name Service to
automatically restart publishing after the service has been restarted.

## With PM2

You can take of advantage of pm2 to start an identity-box service. Make sure you have pm2 installed globally:

```bash
$ npm install pm2 -g
```

### Start service

```bash
$ pm2 start ecosystem.config.js
```

### List all services

```bash
$ pm2 list
```

### Settings on a service

```bash
$ pm2 show nameservice
```

### Logs

To show both stdout and stderr logs run:

```bash
$ pm2 logs nameservice
```

This shows all the logs of nameservice and outputs the last 15 lines (the default).

To see only standard output logs, and print more lines from the output use:

```bash
$ pm2 logs nameservice --out --lines 150
```

### Restart process after editing ecosystem

```bash
$ pm2 delete ecosystem.config.js
$ pm2 start ecosystem.config.js
```

## Compatibility with ESM

We used to supply the package in the ECMAScript module format, so without babel transpilation. Unfortunately, it was making it hard to run with pm2 in the service mode. For this reason, now, before the package can be published it needs to be transpiled and include the default commonjs version in the package.

For those who would prefer to run the service with ESM, this is still possible. In the development just do:

```bash
$ cd workspaces/nameservice
$ ./index.js start
```

in production:

```bash
$ ./node_modules/.bin/nameservice-esm start
```
