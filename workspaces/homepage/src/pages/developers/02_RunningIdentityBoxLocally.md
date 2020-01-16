---
path: /developers/running-identity-box-locally
title: Running Identity Box Locally
tag: developer
---

If you are a contributor, you will certainly like to be able to run the whole
Identity Box ecosystem locally so that it is easier to test your changes.

Our setup comprises of:

1. A local IPFS node,
2. Identity Box - one and the same for the users and the Hush-Hush service,
3. Hush-Hush frontend,
4. Identity App running on an iPhone via Expo app.

Here we take advantage of the scalable architecture and we run only one instance of IPFS and Identity Box. In production, we would have a separate Identity Box for each potential user and also one for the Hush-Hush service.

## Prerequisites

A computer (we work on a MAC), a local network with access to the Internet, and an iOS mobile device.

Also, the `ipfs-http-client` package currently does not work on Node 13 (see https://github.com/ipfs/js-ipfs-http-client/issues/1194). We are using Node 12 LTS for testing.

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
$ ipfs-update install v0.4.20
$ ipfs --version
ipfs version 0.4.20
```

You can use standard IPFS configuration:

```bash
$ ipfs init
$ ipfs daemon
```

## Identity Box

IPFS normally runs on the user's Identity Box, but because the architecture is quite flexible, we can easily separate IPFS and other services that run on the box. [Identity Service](/services/idservice) is currently the only service running on the Identity Box. In order to connect to the external world and be reachable from outside, Identity Box services use [Telepath](/components/telepath). Telepath, in turn uses [Queuing Service](/components/queuing-service).

> Queuing Service is developed and hosted by us. It is a centralized service and we are working to find a better, decentralized alternative. For now, it was just more convenient from the development perspective...

To start a local instance of Queuing Service, in a new terminal run:

```bash
$ cd workspaces/queuing-service
$ yarn start-dev
```

Queuing Service will listen at `localhost:3000`. Before starting a local instance of the Identity Service, we need to make a small digression.

### IPNS

Identity Service depends in IPNS. IPNS still needs some work to be more suitable for production and so, in the mean time, we are faking it using a centralized service. To fake IPNS we use a global register and we use Firebase for it (well - it is kind of nice - Identity Box is there to challenge the status quo but it uses it for our advantage till we are able to defeat it - isn't it symbolic?).

So, sorry about it, but you need to create a Firebase account. Once you have it and you are logged in, create a new project and name it anyway you like. Then create a _Cloud Firestore_ (as opposite to the legacy _Realtime Database_) and thene create a collection named _ipns_. In the rules tab you can place something like this:

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

### Backups

Identity Service provides functionality allowing creating identity backups and restoring from backups. For this to work, Identity Service assumes existence of two environment variables:

1. `IDBOX_BACKUP` holding the absolute path to the backup folder on your machine.
2. `IDBOX_BACKUP_PASSWORD` holding the backup password.

Please add these environment variables to your shell configuration file.

### Identity Service

Now we can start a local instance of the Identity Service. In a new terminal:

```bash
$ cd workspaces/idservice
$ serviceUrl=http://localhost:3000 ./index.js
```

By using `serviceUrl` environmental variable, we indicate that we want to use a local Queuing Service running on `http://localhost:3000`.

## Hush-Hush

In order to start the Hush Hush client, run the following command from to the root of the Identity Box repository:

```bash
$ now dev -l 3001
```

You can access Hush Hush at http://localhost:3001/hush-hush.

## Identity App

To start Identity App, first we have to make sure that it knows the IP address of your machine as it needs
to be able to connect to it from your mobile (IPFS, Queuing Service, and Identity Service need to be on the same local network). Put your IP address in the `development-lqs.config.js` file in the `workspaces/idapp` directory. Make sure you keep the port number.

Now from `workspaces/idapp` run:

```bash
$ yarn env:dev:local-qs
$ yarn start --clear
```

This will open a page in a browser, where you can find a QR Code (it should also show up in the terminal).
Make sure that you have the _Expo_ app installed on your mobile, and then scan the QR Code directly from the Expo app or with the camera on your mobile - it should present you with an option to open the Expo app.

The Identity App app should start and now you can follow the steps from [Experience Identity Box](/experience-identity-box) to test that your setup is working correctly.
