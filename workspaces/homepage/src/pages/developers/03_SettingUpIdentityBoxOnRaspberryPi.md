---
path: /developers/idbox-raspberry-pi
title: Identity Box on Raspberry Pi
tag: developer
---

RaspberryPi is a reliable, powerful, and cost-effective platform that can be used to run Identity Box. In this document we describe how to setup a an Identity Box on Raspberry Pi. We will be using [Raspberry Pi 4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/) with 4GB RAM. Please follow the standard instructions at [Setting up your Raspberry Pi](https://projects.raspberrypi.org/en/projects/raspberry-pi-setting-up) and make sure you [enable ssh access](https://www.raspberrypi.org/documentation/remote-access/ssh/). [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) comes with git already installed.

## Install Node.js and yarn

Identity service requires Node v12 (see https://github.com/ipfs/js-ipfs-http-client/issues/1194) Therefore, we recommend using Node v12 LTS. We recommend using [Node Version Manager](https://github.com/nvm-sh/nvm). To install Node Version Manager (nvm) on your Raspberry run:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
```

Then install Node 12 LTS:

```bash
$ nvm install --lts
```

Let's also install [yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable):

```bash
$ curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
$ echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
$ sudo apt update && sudo apt install --no-install-recommends yarn
```

Everything should be in place now. At the time of writing of this document we had:

```bash
$ node --version
v12.14.1
$ yarn --version
1.21.1
$ git --version
git version 2.20.1
```

## Install IPFS

We will use [IPFS installer](https://github.com/claudiobizzotto/ipfs-rpi):

```bash
$ git clone https://github.com/claudiobizzotto/ipfs-rpi.git
```

We install IPFS v0

```bash
$ cd ipfs-rpi/
$ ./install v0.4.22
$ sudo systemctl stop ipfs-daemon.service
```

This will install, initialize, and start IPFS. We need to alter configuration a bit, so let's stop IPFS for the moment:

```bash
$ sudo systemctl stop ipfs-daemon.service
```

The `ipfs-deamon.service` uses `/usr/local/bin/ipfs daemon --migrate` to start ipfs. For our Identity Box, we need
a different startup command:

```bash
/usr/local/bin/ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate
```

You can change it using:

```bash
$ nano templates/ipfs-daemon.service.tpl
```

Notice, however, that in order for the changes to take effect, you will need to stop the daemon and run installation script again: `./install v0.4.22`.

We also need to change the configuration of our IPFS node. IPFS configuration can be found in `~/.ipfs/config`. While the daemon is stopped, we can edit this file:

```bash
$ nano ~/.ipfs/config
```

We first disable the gateway:

```json
"Addresses": {
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4001",
    "/ip6/::/tcp/4001"
  ],
  "Announce": [],
  "NoAnnounce": [],
  "API": "/ip4/127.0.0.1/tcp/5001",
  "Gateway": ""
},
```

Then we limit the maximum size of file storage to `10MB`:

```json
"Datastore": {
  "StorageMax": "10MB",
```

We change the `MDNS` discovery:

```json
"Discovery": {
  "MDNS": {
    "Enabled": false,
    "Interval": 10
  }
},
```

and finally in `Swarm` section:

```json
"Swarm": {
  "AddrFilters": null,
  "DisableBandwidthMetrics": true,
  "DisableNatPortMap": true,
  "DisableRelay": false,
  "EnableRelayHop": false,
  "EnableAutoRelay": false,
  "EnableAutoNATService": false,
  "ConnMgr": {
    "Type": "basic",
    "LowWater": 100,
    "HighWater": 300,
    "GracePeriod": "20s"
  }
},
```

Also make sure you open port `4001` and map it to your Identity Box IP address so that it is accessible from outside. For this please refer to your ISP router settings.

Finally, create `~/.bash_profile` and add the following to it:

```bash
export IPFS_PATH=$HOME/.ipfs
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi
```

Log out and log in again, check that `$IPFS_PATH` is set, and start IPFS service:

```bash
$ echo $IPFS_PATH
/home/pi/.ipfs
$ sudo systemctl start ipfs-daemon.service
```

Check the configuration:

```bash
$ ipfs config show
```

You can check the status and see how much memory your IPFS is using by running:

```bash
$ sudo systemctl status ipfs-daemon.service
Loaded: loaded (/lib/systemd/system/ipfs-daemon.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2020-01-17 21:09:26 CET; 1min 19s ago
 Main PID: 18796 (ipfs)
    Tasks: 14 (limit: 4915)
   Memory: 11.2M
   CGroup: /system.slice/ipfs-daemon.service
           └─18796 /usr/local/bin/ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate

Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm listening on /ip4/127.0.0.1/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm listening on /ip4/192.168.1.21/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm listening on /ip6/::1/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm listening on /p2p-circuit
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm announcing /ip4/127.0.0.1/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm announcing /ip4/192.168.1.21/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: Swarm announcing /ip6/::1/tcp/4001
Jan 17 21:09:28 idbox-1 ipfs[18796]: API server listening on /ip4/127.0.0.1/tcp/5001
Jan 17 21:09:28 idbox-1 ipfs[18796]: WebUI: http://127.0.0.1:5001/webui
Jan 17 21:09:28 idbox-1 ipfs[18796]: Daemon is ready
```

IPFS may occasionally run into memory problems. Our settings should prevent memory leaks (`HighWater`, `LowWater`, `DisableBandwidthMetrics`, `DisableNatPortMap`), but for now we decided to restart IPFS daemon every 24h. We use cron to accomplish the task:

```bash
$ sudo crontab -e
# add the following line to the config and save
0 1 * * * sudo systemctl restart ipfs-daemon.service
```

Finally, in order to get the content resolving faster, we experiment with keeping our Identity Boxes connected in a Swarm.
If you want to learn more about, there is a good article: [How to Keep Your IPFS Nodes Connected to Ensure Fast Content Discovery](https://medium.com/pinata/how-to-keep-your-ipfs-nodes-connected-and-ensure-fast-content-discovery-7d92fb23da46).

We first create a small bash script in `$HOME` named `keep-swarm-connected.sh`:

```bash
#!/bin/bash

IPFS=/usr/local/bin/ipfs

$IPFS swarm connect /ip4/35.180.235.71/tcp/4001/ipfs/QmabRgVvHEwweh9tUfCRnB6qqrB5GpLurE6zSQFxEqkjEq
```

Make sure that the script is executable:

```bash
$ chmod 755 keep-swarm-connected.sh
```

We will be maintaining connection to our Virtual Identity Box that runs on AWS and `/ip4/35.180.235.71/tcp/4001/ipfs/QmabRgVvHEwweh9tUfCRnB6qqrB5GpLurE6zSQFxEqkjEq` is its multiaddress.

Then we create a service, which will be triggered every minute in order to keep the connection active.
We create file `sudo nano /lib/systemd/system/swarm-connector.service`:

```bash
[Unit]
Description=IPFS Swarm Connector service

[Service]
User=pi
Group=pi
Type=simple
Environment=IPFS_PATH=/home/pi/.ipfs
ExecStart=/home/pi/keep-swarm-connected.sh
```

and a timer file `sudo nano /lib/systemd/system/swarm-connector.timer`:

```bash
[Unit]
Description=Timer that periodically triggers swarm-connector.service
[Timer]
OnBootSec=3min
OnUnitActiveSec=1min
[Install]
WantedBy=timers.target
```

Now, enable and start the timer:

```bash
$ sudo systemctl enable swarm-connector.timer
$ sudo systemctl start swarm-connector.timer
```

You can check the current timer status by running:

```bash
$ systemctl list-timers
```

and to see the status of its last execution:

```bash
$ systemctl status swarm-connector
```

Our virtual identity box also keeps the same kind of connection with other Identity Boxes.

> We still explore. We do not know how many connections we will have to keep alive. We also
consider creating a proper Identity Box service with more intelligence to keep connected
what needs to be connected.

## PM2

We control Identity Box services using [pm2](https://pm2.keymetrics.io/):

```bash
$ yarn global add pm2
```

Please also add `/home/pi/.yarn/bin` to your `PATH`:

```bash
export PATH=$PATH:/home/pi/.yarn/bin
```

This way we can run `pm2` without `yarn`.

In order to prevent that the logs grow without control, please add the `pm2-logrotate` module to pm2:

```bash
$ pm2 install pm2-logrotate
$ pm2 set pm2-logrotate:workerInterval 300
```

The last command above sets the interval at which the logs will be checked to 5min.
To learn more about pm2-logrotate, please consult https://www.npmjs.com/package/pm2-logrotate.

## Name service

To instal Name Service, please use the following commands:

```bash
$ mkdir nameservice
$ cd nameservice
$ yarn add @identity-box/nameservice
$ yarn setup
```

After this start the Name Service using pm2:

```bash
$ cd ~/idbox/nameservice
$ pm2 start ecosystem.config.js
```

## Identity Service

Another step is to install and start the Identity Service.

> After changing the service architecture on the Identity Box, the name of the Identity Service package has changed.
The old `@identity-box/idservice` is depreciated and has been split into two new, lighter packages: `@identity-box/identity-service` and
`@identity-box/box-office`.

> In the past, we used Firebase as to _fake_ IPNS name resolution (a temporary solution to IPNS resolution problems).
We currently experiment with using native IPFS _pubsub_ functionality to secure reliable and fast name resolution
without resorting to external, centralized services. For the time being, as a reference, we keep the documentation
on how to setup Firebase service in the [appendix](#appendix---ipns-with-firebase).
The last version of `@identity-box/idservice` that uses Firebase is `0.1.23` and is no longer compatible with the new service
architecture on the Identity Box. If you have question about using Firebase to mimic IPNS, please contact us.

First please make sure the the following environment variables are defined:

```bash
export IDBOX_BACKUP=$HOME/backups
export IDBOX_BACKUP_PASSWORD=password
```

Please ensure that the `backups` folder exists. It does not have to named `backups` - any name will do,
as long as it is there and the `IDBOX_BACKUP` variable correctly points to it. You can also set
`IDBOX_BACKUP_PASSWORD` to whatever value you want.

> After changing the contents of `~/.bash_profile`, make sure you source it or re-login.

This makes the environment ready to actually install the Identity Service:

```bash
$ mkdir -p idbox/identity-service
$ cd idbox/identity-service
$ yarn add @identity-box/identity-service
$ yarn setup
```

We start Identity Service with pm2:

```bash
$ cd ~/idbox/identity-service
$ pm2 start ecosystem.config.js
```


## Box Office

Finally, we install and start the Box Office service:

```bash
$ mkdir -p idbox/box-office
$ cd idbox/box-office
$ yarn add @identity-box/box-office
$ yarn setup
```

We start Identity Service with pm2:

```bash
$ cd ~/idbox/box-office
$ pm2 start ecosystem.config.js
```

At this point your Identity Box should be correctly set up and you can start experimenting with it.

## Running services as a daemon

> It seems there is a problem running pm2 services that depend on _esm_. We need to investigate. The instructions below are informative for now
and unless you know what you do, please do not use them for now (start the services manually).

To make pm2 running as daemon:

```bash
$ pm2 startup
# this will give you a command that you have to copy and paste in the terminal and execute it, something like:
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v12.14.1/bin /home/pi/.config/yarn/global/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

Finally to freeze a process list on reboot run:

```bash
$ pm2 save
```

You can remove startup script at any time by running:

```bash
$ pm2 unstartup systemd
```

The box should be ready to use.

## Appendix - IPNS with Firebase

Until recently, we used Firebase to _fake_ IPNS name resolution (a temporary solution to IPNS resolution problems).
We currently experiment with using native IPFS _pubsub_ functionality to secure reliable and fast name resolution
without resorting to external, centralized services.

The last version of `@identity-box/idservice` that uses Firebase is `0.1.23`.

Because it uses Admin access (just for simplicity) this means, that if you want to build your own
Identity Box, you need to have Admin access to our Firebase Project.
Obviously, we need to change that.

To have Firebase working, we need to upload the `idbox-firebase.json` file to your Raspberry Pi.
This file currently available to (trusted) contributors only and can be found on our Identity Box
Keybase team share.

Once you have the file on your Raspberry Pi, you need to add the following to `.bash_profile` file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=$HOME/idbox-firebase.json
```

Please make sure that the path to the `idbox-firebase.json` file is correct.
