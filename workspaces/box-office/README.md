# Box Office

A service to handle identity requests on IdBox.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir box-office
$ cd box-office
$ yarn add @identity-box/box-office
$ yarn setup
```

## telepath.config

This is the file where your telepath configuration is kept. The included `telepath.config`
can be used for development (either locally or on your idbox), but should be removed before
launching the actual service so that a fresh telepath configuration is created.

## Queuing Service Url

By default, Box Office will use `https://idbox-queue.now.sh` as the queuing service. If you want
to run it with a local server, you can provide its url using a command line option like this:

```bash
$ ./index.js start -q http://localhost:3000
```
or:

```bash
$ ./index.js start --queuingServiceUrl http://localhost:3000
```

Run `./index.js --help` and `./index.js start --help` for all available commands and options.

> Please, make sure you use your own unique telepath channel when your queuing service
is set to `https://idbox-queue.now.sh` (the default). Otherwise, you may have troubles to understand
what's actually going on. In particular, the provided `telepath.config` should only be use with
you own local queuing service.

## Usage

To directly run the service, use:

```bash
./node_modules/.bin/box-office start
```

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
$ pm2 show box-office
```

### Logs

To show both stdout and stderr logs run:

```bash
$ pm2 logs box-office
```

This shows all the logs of box-office and outputs the last 15 lines (the default).

To see only standard output logs, and print more lines from the output use:

```bash
$ pm2 logs box-office --out --lines 150
```

### Restart process after editing ecosystem

```bash
$ pm2 delete ecosystem.config.js
$ pm2 start ecosystem.config.js
```
