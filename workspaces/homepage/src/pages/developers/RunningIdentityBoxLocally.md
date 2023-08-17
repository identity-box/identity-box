---
path: /developers/running-identity-box-locally
title: Running Identity Box Locally
tag: developer
sortIndex: 20
---

If you are a contributor, you will certainly like to be able to run the whole
Identity Box ecosystem locally so that it is easier to test your changes.

Our setup comprises of:

1. A local IPFS node,
2. [Identity Service](/services/identity-service) for managing identities,
3. [Name Service](/services/nameservice) dedicated to publishing and resolving IPNS names,
4. [Box Office](/services/box-office) responsible for dispatching incoming requests to appropriate services,
5. [Rendezvous Service](/services/rendezvous) providing external connectivity and facilitating so called _tunnels_ between mobile and the web.
6. Hush-Hush frontend,
7. Identity App running on an iPhone via Expo app.

Here we take advantage of the scalable architecture and we run only one instance of IPFS and Identity Box. It means that one and the same Identity Box will serve both the users and the Hush-Hush service. In production, we may prefer to use separate Identity Box for each potential user and also at least one separate Identity Box for each service provider.

## Prerequisites

A computer (we work on a MAC), a local network with access to the Internet, and an iOS mobile device.

Let's start with IPFS node on your computer.

## IPFS node

There are a few ways of installing IPFS. Follow the instructions [Install IPS (Command Line)](https://docs.ipfs.tech/install/command-line/) to install IPFS if you do not have any version installed yet. To update an existing installation you can check [IPFS Updater](https://docs.ipfs.tech/install/ipfs-updater/). IPFS can also be installed directly using IPFS Updater. We used this approach successfully with the previous versions, and in this tutorial we install IPFS using this method. The instructions how to use IPFS Updater directly to install IPFS can be found at [ipfs/ipfs-update](https://github.com/ipfs/ipfs-update). Here we need to apply some corrections, as the GO installer changed a bit in the meantime, and so slightly modified steps need to be followed.

First, make sure you have go installed:

```bash
$ brew install go
$ go version
go version go1.19.2 darwin/arm64
```

> In this tutorial we use M2 laptop. If you have an intel-based machine, the output will be different but everything should work pretty much the same.

Now create a folder (somewhere), eg:

```bash
$ mkdir ~/go
$ cd ~/go
```

and then run:

```bash
$ GO111MODULE=on go install github.com/ipfs/ipfs-update@latest
```

You need to add `$HOME/go/bin` to your `PATH`. Then (in a new terminal or after sourcing your shell config) run:

```bash
$ ipfs-update --version                                                                                                    130 ↵
ipfs-update version v1.9.0
```

Finally, install IPFS:

```bash
$ ipfs-update install v0.16.0
fetching go-ipfs version v0.16.0
Error fetching: open /Users/mczenko/.ipfs/api: no such file or directory
Fetching with HTTP: "https://ipfs.io/ipns/dist.ipfs.tech/go-ipfs/v0.16.0/go-ipfs_v0.16.0_darwin-arm64.tar.gz"
binary downloaded, verifying...
success! tests all passed.
stashing old binary
installing new binary to /Users/mczenko/go/bin/ipfs
checking if repo migration is needed...

Installation complete!
$ ipfs --version
ipfs version 0.16.0
```

> Seems like sometimes ipfs-update faces some problems to fetch the source package from the gateway. What may help sometimes is to try to download the source file via browser and then try again from command line. Otherwise, try using version `0.14.0` or `0.15.0`.

IPFS uses a repository in the local file system. By default, the repo is located at `~/.ipfs`. To change the repo location, set the `$IPFS_PATH` environment variable. For the sake of completeness we set `$IPFS_PATH` to the default value and we also set two other variables which we will need for our Identity Box (local) backups:

```bash
export IPFS_PATH=$HOME/.ipfs
export IDBOX_BACKUP=$HOME/idbox/backup
export IDBOX_BACKUP_PASSWORD=password
```

Also, make sure that the path indicated by `$IDBOX_BACKUP` exists:

```bash
$ mkdir -p idbox/backup
```

You can init and start IPFS node with the following commands:

```bash
$ ipfs init
generating ED25519 keypair...done
peer identity: 12D3KooWPPRYkHgfCNrut8cVKsEFzP3VgzRuRUNKiAKsNhHNNo7T
initializing IPFS node at /Users/mczenko/.ipfs
to get started, enter:

	ipfs cat /ipfs/QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc/readme
$ ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment --enable-gc
```

## Identity Box

IPFS normally runs on the user's Identity Box, but because the architecture is quite flexible, we can easily separate IPFS and other services that run on the box. [Identity Service](/services/identity-service) and [Name Service](/services/nameservice) are two native services currently running on the Identity Box. To dispatch request to the right service, Identity Box uses [Box Office](/services/box-office) service. Finally, external connectivity is provided by the [Rendezvous](/services/rendezvous), which also supports secure communication between user's mobile and a web app running in a browser.

### Backups

Identity Service provides functionality allowing creating identity backups and restoring from backups. For this to work, Identity Service assumes existence of two environment variables:

1. `IDBOX_BACKUP` holding the absolute path to the backup folder on your machine.
2. `IDBOX_BACKUP_PASSWORD` holding the backup password.

Please add these environment variables to your shell configuration file.

### IPNS

Currently, Identity Service depends in IPNS. IPNS still needs some work to be more suitable for production and so, in the mean time, we are experimenting.
Our first approach was to use a centralized service to fake IPNS. In this first approach we used the enemy: Google's Firebase.
In the current implementation though, we are experimenting with using IPFS's native _pubsub_ functionality. This still deserves a separate topic,
and we will publish more about it. For now, it is enough to say that we do not use Firebase at the very moment. **Yes, we are free from Google**.

> For time being, we still keep the related documentation below in the [appendix](#appendix---ipns-with-firebase) though.

### Name Service

In order to start a local instance of the Name Service, in a new terminal do:

```bash
$ cd workspaces/nameservice
$ source/index.js start
```

That's it. Use `--help` to see all available options.

### Identity Service

In a similar way we start Identity Service:

```bash
$ cd workspaces/identity-service
$ source/index.js start
```

### Box Office

Then, to tie everything up, we start the Box Office service:

```bash
$ cd workspaces/box-office
$ source/index.js start
```

### Rendezvous

Finally, to provide external connectivity, we start the Rendezvous service:

```bash
$ source/index.js start -b http://192.168.1.24:3100
```

With the `-b` or `--baseUrl` option we provide the rendezvous url, which we want to be used externally. Using this option, Rendezvous service will generate a QR code that has to be scanned when associating the box with the user's Identity App. Rendezvous service listens on port `3100` by default and if you want to use different port you can use `-p` option. Use `./index.js start --help` to learn more about available options.

## Hush-Hush

In order to start the Hush Hush client in development mode, first, we need to make sure the `.env.development` is up to date. For instance:

```bash
VITE_HUSH_HUSH_RENDEZVOUS_URL=http://192.168.1.24:3100
VITE_HUSH_HUSH_BASEURL=http://localhost:5173
```

The `VITE_HUSH_HUSH_RENDEZVOUS_URL` has to be the same address you used for your rendezvous service (provided with the `-b` option).
The `VITE_HUSH_HUSH_BASEURL` is used when generating local hush links.

Having this correctly set, we can start the Hush Hush service as follows:

```bash
$ cd workspaces/hush-hush
$ yarn dev
```

You can then access Hush Hush at http://localhost:5173/.

## Identity App

To start Identity App, from `workspaces/idapp`, you may first need to build the so-called development build (for more information take a look at [How to create a development build](/services/idapp/#how-to-create-a-development-build)). This assumes you have Xcode correctly setup on your machine.

```bash
$ APP_VARIANT=development yarn expo run:ios -d
```

This should build and install an iOS app on your iOS device (the name of the app will be _Identity App (Dev)_). With this app your can conveniently work on your Identity App in the same way you used the former Expo Go app.

You can now follow the steps from [Experience Identity Box](/experience-identity-box) to test that your setup is working correctly.

## Appendix - IPNS with Firebase

First, you need to create a Firebase account. Once you have it and you are logged in, create a new project and name it anyway you like. Then create a _Cloud Firestore_ (as opposite to the legacy _Realtime Database_) and thene create a collection named _ipns_. In the rules tab you can place something like this:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

This will basically prevent any public read/write access to the database and we will use _Admin SDK_ to access the _ipns_ collection.

In the Firebase project settings, in the _Service accounts_ tab select _Generate new private key_, then confirm by clicking _Generate Key_. Securely store the JSON file containing the key.

Now, add `GOOGLE_APPLICATION_CREDENTIALS` environment variable to your shell configuration file setting its value to the path to the generated JSON file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=<absolute_path>
```

Your Firebase setup should now be ready for use. For more details please consult [Add the Firebase Admin SDK to Your Server](https://firebase.google.com/docs/admin/setup).