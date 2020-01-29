# Name Service

A service to handle name resolution requests in a fully distributed way.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir nameservice
$ cd nameservice
$ yarn add @identity-box/nameservice
$ yarn setup
```
## IPFS

Make sure the IPFS daemon is running:

```bash
$ ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate
```

## Required environment variables

Name Service assume some environment variables to be set.

### IPFS_PATH

`IPFS_PATH` needs to point to the IPFS data directory. On the local machine this is usually `$HOME/.ipfs`.

## Usage

To directly run the service, use:

```bash
./node_modules/.bin/nameservice
```

All currently published identities are listed in the `Identities.json` file. This allows the Name Service to
automatically restart publishing after the service has been restarted.

## With PM2

You can take of advantage of pm2 to start an identity-box service. Make sure you have pm2 installed globally:

```bash
$ yarn global add pm2
```

and ensure it is in `$PATH`:

```bash
export PATH=$PATH:/home/pi/.yarn/bin
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

```
$ pm2 delete ecosystem.config.js
$ pm2 start ecosystem.config.js
```
