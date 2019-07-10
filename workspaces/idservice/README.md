# Identity Service

A service to handle identity requests on IdBox.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir idservice
$ cd idservice
$ yarn add @identity-box/idservice
```

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
