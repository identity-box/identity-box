# Identity Service

A service to handle identity requests on IdBox.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir idservice
$ cd idservice
$ yarn add @identity-box/idservice
$ yarn setup.sh
```

## telepath.config

This is the file where your telepath configuration is kept. The included `telepath.config`
can be used for development (either locally or on your idbox), but should be removed before
launching the actual service so that a fresh telepath configuration is created.

The channel provided in the provided `telepath.config` matches the `idapp` configuration in
`workspaces/idapp/development-lqs.config`.

## serviceUrl

By default, idservice will use `https://idbox-queue.now.sh` as the queuing service. If you want
to run it with a local server, you can set the `serviceUrl` environment variable and point it
to the service you want to use, e.g:

```bash
$ serviceUrl=http://localhost:3000 ./index.js
```

The command above applies when you run idservice out of the monorepo itself. If
you follow the standard installation, please follow the instructions below.

## Usage

To directly run the service, use:

```
./node_modules/.bin/idservice
```

## With PM2

You can take of advantage of pm2 to start an identity-box service. Make sure you have pm2 installed globally:

```bash
$ yarn global add pm2
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
$ pm2 show idservice
```

### Logs

All:

```bash
$ pm2 logs idservice
```

This shows all the logs of idservice and outputs the last 15 lines (the default).

To see only standard output logs, and print more lines from the output use: 

```bash
$ pm2 logs idservice --out --lines 150
```

### Restart process after editing ecosystem

```
$ pm2 delete ecosystem.config.js
$ pm2 start ecosystem.config.js
```
