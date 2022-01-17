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

Also, the `ipfs-http-client` package currently does not work on Node 13 (see https://github.com/ipfs/js-ipfs-http-client/issues/1194). We are using Node 14 LTS for testing.

> This has to be re-evaluated. Maybe it is already supported.

Let's start with IPFS node on your computer.

## IPFS node

If you do not have IPFS installed, you have to install it now. You can find the instructions at https://docs.ipfs.io/guides/guides/install/. We recommend using `ipfs-update`. It is a bit more complex at first, but then it is way easier to switch between ipfs versions:

```bash
# first install go
$ brew install go

# install ipfs-update
$ GO111MODULE=on go get github.com/ipfs/ipfs-update

# check that $HOME/go/bin is in your PATH - othrwise the following command will fail
$ ipfs-update --version
ipfs-update version 1.5.3-dev

# install ipfs - currently we use version 0.4.20
$ ipfs-update install v0.7.0
$ ipfs --version
ipfs version 0.7.0
```

You can init and start IPFS node with the following commands:

```bash
$ ipfs init
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
$ ./index.js start
```

That's it. Use `--help` to see all available options.

### Identity Service

In a similar way we start Identity Service:

```bash
$ cd workspaces/identity-service
$ ./index.js start
```

### Box Office

Then, to tie everything up, we start the Box Office service:

```bash
$ cd workspaces/box-office
$ ./index.js start
```

### Rendezvous

Finally, to provide external connectivity, we start the Rendezvous service:

```bash
$ ./index.js start -b http://192.168.1.15:3100
```

With the `-b` or `--baseUrl` option we provide the rendezvous url, which we want to be used externally. Using this option, Rendezvous service will generate a QR code that has to be scanned when associating the box with the user's Identity App. Rendezvous service listens on port `3100` by default and if you want to use different port you can use `-p` option. Use `./index.js start --help` to learn more about available options.

## Hush-Hush

In order to start the Hush Hush client, first, we need to provide a local `.env.local` configuration file:

```bash
$ cd workspaces/hush-hush
$ touch .env.local
```

> Do not commit `.env.local` to the repo. We already added it to the .gitignore in `workspaces/hush-hush/.gitignore`.

In this file we need to set the `NEXT_PUBLIC_HUSH_HUSH_RENDEZVOUS_URL` to hold the same value we provided when starting the Rendezvous service using the `-b` option. In our example this would be then: `http://192.168.1.15:3100`. Thus, the content of the `.env.local` should be:

```bash
NEXT_PUBLIC_HUSH_HUSH_RENDEZVOUS_URL=http://192.168.1.15:3100
```

Having this, we can start the Hush Hush service as follows:

```bash
$ cd workspaces/hush-hush
$ yarn dev
```

You can then access Hush Hush at http://localhost:3000.

## Identity App

To start Identity App, from `workspaces/idapp` run:

```bash
$ yarn start --clear
```

This will open a page in a browser, where you can find a QR Code (it should also show up in the terminal).
Make sure that you have the _Expo_ app installed on your mobile, and then scan the QR Code directly from the Expo app or with the camera on your mobile - it should present you with an option to open the Expo app.

The Identity App app should start and now you can follow the steps from [Experience Identity Box](/experience-identity-box) to test that your setup is working correctly.

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