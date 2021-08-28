# Box Office

A service to handle identity requests on IdBox.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir box-office
$ cd box-office
$ yarn set version berry
$ echo 'nodeLinker: node-modules' >> .yarnrc.yml
$ yarn init
$ yarn add @identity-box/box-office
$ yarn setup
```

## Usage

To directly run the service, use:

```bash
yarn box-office start
```

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

## Compatibility with ESM

We used to supply the package in the ECMAScript module format, so without babel transpilation. Unfortunately, it was making it hard to run with pm2 in the service mode. For this reason, now, before the package can be published it needs to be transpiled and include the default commonjs version in the package.

For those who would prefer to run the service with ESM, this is still possible. In the development just do:

```bash
$ cd workspaces/box-office
$ ./index.js start
```

in production:

```bash
$ yarn box-office-esm start
```
