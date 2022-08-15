---
path: /developers/idbox-raspberry-pi
title: Identity Box on Raspberry Pi
tag: developer
sortIndex: 30
---

RaspberryPi is a reliable, powerful, and cost-effective platform that can be used to run Identity Box. In this document we describe how to setup a an Identity Box on Raspberry Pi. We will be using [Raspberry Pi 4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/) with 4GB RAM. Please follow the standard instructions at [Setting up your Raspberry Pi](https://projects.raspberrypi.org/en/projects/raspberry-pi-setting-up) and make sure you [enable ssh access](https://www.raspberrypi.org/documentation/remote-access/ssh/). [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) comes with git already installed.

## Install Node.js and yarn

We currently use Node v16 LTS. We recommend using [Node Version Manager](https://github.com/nvm-sh/nvm). To install Node Version Manager (nvm) on your Raspberry run:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Then install Node 16 LTS:

```bash
$ nvm install --lts
```

Let's also install [yarn](https://yarnpkg.com/getting-started/install):

```bash
$ corepack enable
```

Everything should be in place now. At the time of writing of this document we had:

```bash
$ node --version
v16.16.0
$ yarn --version
1.22.15
$ git --version
git version 2.25.1
```

## Install IPFS

We will use [IPFS installer](https://github.com/claudiobizzotto/ipfs-rpi):

```bash
$ git clone https://github.com/claudiobizzotto/ipfs-rpi.git
```

We install IPFS v0.14.0

```bash
$ cd ipfs-rpi/
$ ./install v0.14.0
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
$ cd ipfs-rpi/
$ nano templates/ipfs-daemon.service.tpl
```

and change set:

```bash
$ ExecStart=/usr/local/bin/ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate
```

Notice, however, that in order for the changes to take effect, you will need to stop the daemon and run installation script again: `./install v0.14.0`.

So after changing the template file, we run again:

```bash
$ cd ipfs-rpi/
$ ./install v0.14.0
>>> Starting IPFS
>>> All done.
```

We also need to change the configuration of our IPFS node. IPFS configuration can be found in `~/.ipfs/config`. While the daemon is stopped, we can edit this file:

```bash
$ nano ~/.ipfs/config
```

We first disable the gateway:

```json
"Addresses": {
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4001",
    "/ip6/::/tcp/4001",
    "/ip4/0.0.0.0/udp/4001/quic",
    "/ip6/::/udp/4001/quic"
  ],
  "Announce": [],
  "AppendAnnounce": [],
  "NoAnnounce": [],
  "API": "/ip4/127.0.0.1/tcp/5001",
  "Gateway": ""
},
```

Then we limit the maximum size of file storage to `5GB` (default is `10G`):

```json
"Datastore": {
  "StorageMax": "5GB",
```

> You may skip that if you have hardware with more storage available.

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
  "RelayClient": {},
  "RelayService": {},
  "Transports": {
    "Network": {},
    "Security": {},
    "Multiplexers": {}
  },
  "ConnMgr": {
    "Type": "basic",
    "LowWater": 100,
    "HighWater": 300,
    "GracePeriod": "20s"
  }
},
```

For reference, below is the whole `~/.ipfs/config`:

```json
{
  "Identity": {
    "PeerID": "<...>",
    "PrivKey": "<...>"
  },
  "Datastore": {
    "StorageMax": "10GB",
    "StorageGCWatermark": 90,
    "GCPeriod": "1h",
    "Spec": {
      "mounts": [
        {
          "child": {
            "path": "blocks",
            "shardFunc": "/repo/flatfs/shard/v1/next-to-last/2",
            "sync": true,
            "type": "flatfs"
          },
          "mountpoint": "/blocks",
          "prefix": "flatfs.datastore",
          "type": "measure"
        },
        {
          "child": {
            "compression": "none",
            "path": "datastore",
            "type": "levelds"
          },
          "mountpoint": "/",
          "prefix": "leveldb.datastore",
          "type": "measure"
        }
	      ],
      "type": "mount"
    },
    "HashOnRead": false,
    "BloomFilterSize": 0
  },
  "Addresses": {
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4001",
      "/ip6/::/tcp/4001",
      "/ip4/0.0.0.0/udp/4001/quic",
      "/ip6/::/udp/4001/quic"
    ],
    "Announce": [],
    "AppendAnnounce": [],
    "NoAnnounce": [],
    "API": "/ip4/127.0.0.1/tcp/5001",
    "Gateway": ""
  },
  "Mounts": {
    "IPFS": "/ipfs",
    "IPNS": "/ipns",
    "FuseAllowOther": false
  },
  "Discovery": {
    "MDNS": {
      "Enabled": false
    }
  },
  "Routing": {
    "Type": "dht",
    "Routers": null
  },
  "Ipns": {
    "RepublishPeriod": "",
    "RecordLifetime": "",
    "ResolveCacheSize": 128
  },
  "Bootstrap": [
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
    "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb"
  ],
  "Gateway": {
    "HTTPHeaders": {
      "Access-Control-Allow-Headers": [
        "X-Requested-With",
        "Range",
        "User-Agent"
      ],
      "Access-Control-Allow-Methods": [
        "GET"
      ],
      "Access-Control-Allow-Origin": [
        "*"
      ]
    },
    "RootRedirect": "",
    "Writable": false,
    "PathPrefixes": [],
    "APICommands": [],
    "NoFetch": false,
    "NoDNSLink": false,
    "PublicGateways": null
  },
  "API": {
    "HTTPHeaders": {}
  },
  "Swarm": {
    "AddrFilters": null,
    "DisableBandwidthMetrics": true,
    "DisableNatPortMap": true,
    "RelayClient": {},
    "RelayService": {},
    "Transports": {
      "Network": {},
      "Security": {},
      "Multiplexers": {}
    },
    "ConnMgr": {
      "Type": "basic",
      "LowWater": 100,
      "HighWater": 300,
      "GracePeriod": "20s"
    },
    "ResourceMgr": {}
  },
  "AutoNAT": {},
  "Pubsub": {
    "Router": "",
    "DisableSigning": false
  },
  "Peering": {
    "Peers": null
  },
  "DNS": {
    "Resolvers": {}
  },
  "Migration": {
    "DownloadSources": [],
    "Keep": ""
  },
  "Provider": {
    "Strategy": ""
  },
  "Reprovider": {
    "Interval": "12h",
    "Strategy": "all"
  },
  "Experimental": {
    "FilestoreEnabled": false,
    "UrlstoreEnabled": false,
    "GraphsyncEnabled": false,
    "Libp2pStreamMounting": false,
    "P2pHttpProxy": false,
    "StrategicProviding": false,
    "AcceleratedDHTClient": false
  },
  "Plugins": {
    "Plugins": null
  },
  "Pinning": {
    "RemoteServices": {}
  },
  "Internal": {}
}
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
● ipfs-daemon.service - IPFS daemon
   Loaded: loaded (/lib/systemd/system/ipfs-daemon.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2022-01-14 02:28:45 CET; 20s ago
 Main PID: 517 (ipfs)
    Tasks: 10 (limit: 4915)
   Memory: 87.9M
   CGroup: /system.slice/ipfs-daemon.service
           └─517 /usr/local/bin/ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc --migrate

Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm listening on /ip6/::1/tcp/4001
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm listening on /ip6/::1/udp/4001/quic
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm listening on /p2p-circuit
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm announcing /ip4/127.0.0.1/tcp/4001
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm announcing /ip4/127.0.0.1/udp/4001/quic
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm announcing /ip6/::1/tcp/4001
Jan 14 02:28:48 idbox-1-new ipfs[517]: Swarm announcing /ip6/::1/udp/4001/quic
Jan 14 02:28:48 idbox-1-new ipfs[517]: API server listening on /ip4/127.0.0.1/tcp/5001
Jan 14 02:28:48 idbox-1-new ipfs[517]: WebUI: http://127.0.0.1:5001/webui
Jan 14 02:28:48 idbox-1-new ipfs[517]: Daemon is ready
```

> if you do not see the `Memory` entry above, you may need to add
>
> ```bash
> cgroup_enable=memory cgroup_memory=1
> ```
> 
> to `/boot/cmdline.txt` and restart your box with `sudo shutdown -r now`

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

> We still explore. We do not know how many connections we will have to keep alive. We also consider creating a proper Identity Box service with more intelligence to keep connected what needs to be connected.

## PM2

We control Identity Box services using [pm2](https://pm2.keymetrics.io/):

```bash
$ npm install pm2 -g
```

In order to prevent that the logs grow without control, please add the `pm2-logrotate` module to pm2:

```bash
$ pm2 install pm2-logrotate
$ pm2 set pm2-logrotate:workerInterval 300
```

The last command above sets the interval at which the logs will be checked to 5min.
To learn more about pm2-logrotate, please consult https://www.npmjs.com/package/pm2-logrotate.

## Box Office

Finally, we install and start the Box Office service:

```bash
$ npx github:/identity-box/cli install-service box-office
```

We start the Box Office service with pm2:

```bash
$ cd ~/idbox/box-office
$ pm2 start ecosystem.config.js
```

## Name service

To instal Name Service, please use the following commands:

```bash
$ npx github:/identity-box/cli install-service nameservice
```

After this start the Name Service using pm2:

```bash
$ cd ~/idbox/nameservice
$ pm2 start ecosystem.config.js
```

## Identity Service

Another step is to install and start the Identity Service.

First please make sure the the following environment variables are defined:

```bash
export IDBOX_BACKUP=$HOME/backups
export IDBOX_BACKUP_PASSWORD=password
```

Please also ensure that the `backups` folder exists. It does not have to be named `backups` - any name will do,
as long as it is there and the `IDBOX_BACKUP` variable correctly points to it. You can also set
`IDBOX_BACKUP_PASSWORD` to whatever value you want.

> After changing the contents of `~/.bash_profile`, make sure you source it or re-login.

This makes the environment ready to actually install the Identity Service:

```bash
$ npx github:/identity-box/cli install-service identity-service
```

We start Identity Service with pm2:

```bash
$ cd ~/idbox/identity-service
$ pm2 start ecosystem.config.js
```

## Rendezvous

The Rendezvous service provides external connectivity to the box and this needs a bit more setup.

We start with:

```bash
$ npx github:/identity-box/cli install-service rendezvous
```

Then, we open `ecosystem.config.js` and change the `args` parameter to include the external domain name
to be used as your rendezvous url:

```javascript
args: 'start -b https://<your-domain-name>',
```

You need to register (buy) a domain name you want to use and make sure you have an `A` record pointing to your
IP address. You also have to make sure your router is configured appropriately so that the correct ports are open
and mapped to your identity box. If you do not want to buy a domain name yet or your IP address changes often,
you can try using services [http://noip.com/](http://noip.com/) or your preferred DynamicDNS solution.
In the end, you need to have a url that resolves to your Identity Box.

> Yes, this is all impossible to do for a regular user, but if you are reading this, you must know what you are doing.
> We work hard to make this experience painless for the regular users that will decide to acquire the box from us.

You will also need a _reverse-proxy_ server to point this url to your rendezvous service on the box.
If you use [NGINX](https://www.nginx.com) (`sudo apt-get install nginx`) you can use the following configuration:

```
server {
        listen 80;
        server_name <your-domain-url>;
        return 301 https://$host$request_uri;
}

server {
        listen 443 ssl;
        server_name <your-domain-url>;
        ssl_certificate /etc/letsencrypt/live/<your-domain>/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
        location /  {
                proxy_pass    http://localhost:3100;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

> To setup the SSL certificates, please check 
> [Manual Let's Encrypt certificates](https://idbox.online/developers/contributing#manual-lets-encrypt-certificates).

Save this file as, for instance, `/etc/nginx/sites-available/idbox`, and then do:

```bash
$ cd /etc/nginx/sites-enabled/
$ sudo ln -s /etc/nginx/sites-available/idbox idbox
```

so that you get:

```bash
$ ls -l
total 0
lrwxrwxrwx 1 root root 32 Jun  6 23:39 idbox -> /etc/nginx/sites-available/idbox
```

Then, restart the nginx service:

```bash
$ sudo systemctl restart nginx
```

> If you are getting an error like this:
>
> ```bash
> ● nginx.service - A high performance web server and a reverse proxy server
>   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
>   Active: failed (Result: exit-code) since Fri 2022-01-14 06:03:36 CET; 22s ago
>     Docs: man:nginx(8)
>  Process: 6900 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=1/FAILURE)
>
> Jan 14 06:03:35 idbox-1-new systemd[1]: Starting A high performance web server and a reverse proxy server...
> Jan 14 06:03:36 idbox-1-new nginx[6900]: nginx: [emerg] could not build server_names_hash, you should increase server_names_hash_bucket_size: 32
> Jan 14 06:03:36 idbox-1-new nginx[6900]: nginx: configuration file /etc/nginx/nginx.conf test failed
> Jan 14 06:03:36 idbox-1-new systemd[1]: nginx.service: Control process exited, code=exited, status=1/FAILURE
> Jan 14 06:03:36 idbox-1-new systemd[1]: nginx.service: Failed with result 'exit-code'.
> Jan 14 06:03:36 idbox-1-new systemd[1]: Failed to start A high performance web server and a reverse proxy server.
> ```
> 
> you may need to update your `/etc/nginx/nginx.conf` file and make sure that line:
>
> ```bash
> server_names_hash_bucket_size 64;
> ```
>
> is **not** commented out.

Finally, start the Rendezvous service:

```bash
$ cd ~/idbox/rendezvous
$ pm2 start ecosystem.config.js
```

At this point your Identity Box should be correctly set up and you can start experimenting with it.

## Running services as a daemon

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

## Upgrading Identity Box Services

For each service follow the steps (we use `box-office` below as an example):

```bash
$ cd ~/idbox/box-office
$ yarn up @identity-box/box-office
$ pm2 reload ecosystem.config.js
```

Do the same for each single servic replacing `box-office` with the appropriate package name.

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
