# Rendezvous Service

A service to provide external connectivity to the box from the browsers and mobile devices.

> Since version `0.1.38` all Identity Box services are ESM-only. No building is required.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ npx github:/identity-box/cli install-service rendezvous
```

## Usage

To directly run the service, use:

```bash
./node_modules/.bin/rendezvous start
```

## With PM2

You can take of advantage of pm2 to start an identity-box service. Make sure you have pm2 installed globally:

```bash
$ npm install pm2 -g
```

### Start service

```bash
$ pm2 start ecosystem.config.cjs
```

### List all services

```bash
$ pm2 list
```

### Settings on a service

```bash
$ pm2 show rendezvous
```

### Logs

To show both stdout and stderr logs run:

```bash
$ pm2 logs rendezvous
```

This shows all the logs of identity-service and outputs the last 15 lines (the default).

To see only standard output logs, and print more lines from the output use:

```bash
$ pm2 logs rendezvous --out --lines 150
```

### Restart process after editing ecosystem

```bash
$ pm2 delete ecosystem.config.cjs
$ pm2 start ecosystem.config.cjs
```
