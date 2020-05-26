# Identity Service

A service to handle identity related operations.

## Installation

On your identity-box, first create a folder where you want your service to be installed (we recommend that you use the name of the service as the name of the folder). Then install the service as follows:

```bash
$ mkdir identity-service
$ cd identity-service
$ yarn add @identity-box/identity-service
$ yarn setup
```

## IPFS

Make sure the IPFS daemon is running:

```bash
$ ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate
```

## Required environment variables

Identity Service assume some environment variables to be set.

### IPFS environment variables

Identity Service assume some environment variables to be set.

`IPFS_PATH` needs to point to the IPFS data directory. On the local machine this is usually `$HOME/.ipfs`.

`IPFS_ADDR` contains the address of the IPFS host. This needs to conform to the
[multiaddr](https://multiformats.io/multiaddr/) format. When this environment
variable is not set, the address will default to `/ip4/127.0.0.1/tcp/5001`.

### Automatic backups

For the automatic backups functionality, Identity Service requires two environment variables to be set: `IDBOX_BACKUP` holding the absolute path
to the backup directory, and `IDBOX_BACKUP_PASSWORD` to hold the password to encrypt the idbox IPNS keys. Every key from `$IPFS_PATH/keystore` will
have its corresponding `pem` file in `$IDBOX_BACKUP` directory. `$IDBOX_BACKUP` will also contain a `backup` file with all user's identities from the IdApp (encrypted).

## Usage

To directly run the service, use:

```bash
./node_modules/.bin/identity-service start
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
$ pm2 show identity-service
```

### Logs

To show both stdout and stderr logs run:

```bash
$ pm2 logs identity-service
```

This shows all the logs of identity-service and outputs the last 15 lines (the default).

To see only standard output logs, and print more lines from the output use:

```bash
$ pm2 logs identity-service --out --lines 150
```

### Restart process after editing ecosystem

```bash
$ pm2 delete ecosystem.config.js
$ pm2 start ecosystem.config.js
```
