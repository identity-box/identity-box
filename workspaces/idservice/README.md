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

## GOOGLE\_APPLICATION\_CREDENTIALS

We use Firebase temporarily when waiting for IPNS to be more reliable.
To have it working, you need to copy `idbox-firebase.json` (Keybase) to your system and then before starting the service make sure that the following variable is pointing to the full path to the above mentioned file. This will idservice to use Firebase Admin SDK.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=<path to idbox-firebase.json>
```

## serviceUrl

By default, idservice will use `https://idbox-queue.now.sh` as the queuing service. If you want
to run it with a local server, you can set the `serviceUrl` environment variable and point it
to the service you want to use, e.g:

```bash
$ serviceUrl=http://localhost:3000 ./index.js
```

The command above applies when you run idservice out of the monorepo itself. If
you follow the standard installation, please follow the instructions below.

> Please, make sure you use your own unique telepath channel when your queuing service
is set to `https://idbox-queue.now.sh` (the default). Otherwise, you may have troubles to understand
what's actually going on. In particular, the provided `telepath.config` should only be use with
you own local queuing service.

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
