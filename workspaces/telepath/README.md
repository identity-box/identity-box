# Telepath

Provides a secure channel for communication between a web app running in a
 browser and an app running on a mobile device.

Setting up a secure channel between the mobile device and a browser is done
using a QR code that is presented by the web app whenever a secure channel is
required. The user can then open the secure channel by scanning the QR code
using the app on the phone.

## Crypto

Telepath uses [TweetNaCl.js](https://tweetnacl.js.org) for all of its cryptographic operations on the web.
For React Native (EXPO), Telepath requires external `randomBytes` function. Telepath uses `randomBytes` internally solely
to generate nonces (see more below on the discussion about using Telepath with React Native).

## Description

Telepath consists of a javascript library that can be used in web apps. It can also
be used in React Native (see below).

Because both the browser and phone are likely to be behind distinct [NAT], we
use a service with a public ip address to facilitate peer-to-peer communication
between them. This is a fairly simple service that only holds end-to-end
encrypted messages in queues.

Setting up a secure channel is done using these steps:

1. A web or a mobile app requests a secure connection to the mobile app by invoking the
   `createChannel` function on the javascript library and providing unique random channel id
   and a symmetric encryption key.
2. The web app displays a QR code containing the channel id `I` and key `E`.
4. The owner of the phone opens the app, points the camera to the QR code.
5. The phone app extracts the channel id and the key from the QR code.
6. Both phone and web app can now communicate on channel `I`. They encrypt/decrypt
   their messages using key `E`.

## QR Code

The channel id `I` and key `E` are first encoded in a URL, and then the URL is
encoded in a QR code. This allows a user to scan the QR code using the standard
camera app in iOS and be directed to the telepath-enabled mobile app.

An example of such a URL and its QR Code:

```bash
https://example.com/telepath/connect#I=2oxSJ6_eyP7JXsn6VK7ooB_u&E=m8JzVbVlEwlzzR0-o8-AU0F6oONYcqvLW5YVLvLLP6s&A=SWRlbnRpdHlCb3g
```

![Example QR Code](https://github.com/identity-box/identity-box/blob/master/workspaces/telepath/images/ExampleQRCode.png?raw=1)

The URL is made up of the following components:

```bash
<base url>telepath/connect#I=<channel id>&E=<encryption key>&A=<application name>
```

where:

* `<base url>` is the url that is registered to open the mobile app in [iOS][1]
  or [Android][2],
* `<channel id>` is the channel id string, [percent encoded][3] for use in a URL
  fragment,
* `<encryption key>` is the encryption key, [base64url encoded][4],
* `<application name>` is the base64 encoded application name.

## Usage

Add `@identity-box/telepath` as a dependency:

```bash
yarn add @identity-box/telepath
```

Then import `Telepath` in your own module:

```javascript
import { Telepath } from '@identity-box/telepath'
```

### Creating an instance of Telepath

You create an instance of Telepath by providing the URL of the queuing
service to the `Telepath` class:

```javascript
const telepath = new Telepath({ serviceUrl: 'https://queuing.example.com' })
```

Having an instance of `Telepath`, you can create a new channel
with the given id and a random encryption key as follows:

```javascript
import base64url from 'base64url'
import nacl from 'tweetnacl'

createRandomId = () => {
  const idSize = 18
  const idBytes = nacl.randomBytes(idSize)
  return base64url.encode(idBytes)
}

createRandomKey = () => {
  return nacl.randomBytes(nacl.secretbox.keyLength)
}

const clientId = base64url.encode(nacl.randomBytes(8))

const channel = this.telepath.createChannel({
  id: this.createRandomId(),
  key: this.createRandomKey(),
  appName: 'App Name',
  clientId: clientId
})
```

We see that an identifier is just a base64 encoded random buffer.
The same applies for the key, but here the length is aligned with `nacl.secretbox.keyLength`.
You have to take this into account when using your own `randomBytes` function (e.g. on React Native).

A new thing in the example above is `clientId`. Client Id is not something that belongs to the channel description
and formally speaking is optional, although highly recommended.

Telepath always maintains a channel between two, and only two parties at the very moment. Internally, when you subscribe
to a channel (see below), the queueing service that telepath uses as the exchange proxy, will perform so called _identification_.
It will record the reference to the socket of the subscribing client. Maximum two distinct client sockets can be recorded, meaning
no third party can join the conversation. For the reliability of this approach, is is important that the client properly _disconnects_
(at the socket level, not just unsubscribing from the observer). If this fails for some reason, the channel will be blocked forever.

In order to prevent this from happening, we let the client to provide its unique id. Each next subscription with an existing id will replace
the previous subscription - more precisely, the client socket related to the _old_ subscription will be replaced with the client socket
for the new subscription.

This creates a risk that anyone knowing your channel id and client id can kick you out of the channel and take your place. We need to further
consider this arrangement and we may come with extra precautions, but for now the client id should be kept secret with the same security
requirements as you would use for the channel key.

Another important reason for having a client id is for proper handling of pending messages. After the party is subscribed to a channel, it may
immediately start emitting messages even when the second party is not yet there. Our queuing service, will queue incoming messages
(up to 10 messages, after which the `emit` operation will throw an exception - see below). When the other party subscribes, all pending
messages will be delivered to it. But now, a bit cumbersome situation happens when the only subscribed party emits some messages, disconnects, and
then resubscribes. Without knowing who is the sender of the messages, we would have no choice but to send them all to the net first
subscribing party. In this case, the original sender would receive all her messages and the next subscribing (intended) receiver would not
receive any single message. Using client id allows us to solve this problem easily.

## Subscribing to a channel

After creating a channel you first connect to it and then subscribe. If you want to be sure you do not miss any pending messages you may also decide to subscribe before connecting (but this should not really be necessary):

```javascript
try {
  const subscription = channel.subscribe(message => {
    console.log('received message: ', message)
  }, error => {
    console.log('error: ', error)
  })
  await channel.connect()
} catch (e) {
  console.log(e.message)
}

const message = { jsonrpc: '2.0', method:'test', params: [1, { a:1, b: 'text' }] }

try {
  await channel.emit(message)
} catch (e) {
  console.log(e.message)
}

// later...
channel.unsubscribe(subscription)
```

Notice that you can have many subscriptions and you will be notified on all of them.

Connecting is an asynchronous operation and consists of establishing the connection
with the web socket server and then identifying itself as one of the connecting parties (as described above). You must wait for the
`connect` call to finish before emitting messages. If you `emit` a message before `connect` finishes, an exception will be thrown.

`connect` may throw one of the following errors:

1. `new Error('connection timeout')` - when connecting to web socket times out
2. `new Error('callback timeout')` - when there was no acknowledgment from the web socket server (queuing service)
3. `new Error('too many clients for queue')` - when a client attempts to connect when two other clients are already connected and the new client has client id that does not match any of the two other clients.

Any errors happening after a successful connection will be reported to the `onError` handler if provided.

Emitting messages is also asynchronous operation and it can throw on of the following errors:

1. `new Error('callback timeout')` - when there was no acknowledgment from the web socket server
2. `new Error('message too long')` - when the message is longer than queuing service tolerates
3. `new Error('too many pending messagess')` - when queuing service does not have capacity to keep more pending messages
4. `new Error('request is not a JSON-RPC 2.0 object')`
5. `new Error('JSON-RPC message may not have an "id" property')`
6. `new Error('JSON-RPC request is missing a "method" property')`
7. potentially other errors thrown as the result of the encryption or encoding failure

### Obtaining a connection URL

At some point, you will need to create a QR code so that you can scan
with a mobile app and obtain the channel identifier and the symmetric
key as described above. `Telepath` provides a convenience method that given the base url
(see Section [QR Code](#qr-code) above) it return a properly formatted connection URL.
You can use this connection URL as an input to your QR code generation library.
The resulting QR code can be scanned by the mobile
app and used to connect to this channel. The telepath library does not include
functionality for displaying QR codes, you can use a QR code component such as
[qrcode.react](https://www.npmjs.com/package/qrcode.react) for this purpose.

```javascript
const connectUrl = channel.createConnectUrl('https://example.com')
// returns: https://example.com/telepath/connect#I=<channelId>&E=<symmetricKey>&A=SWRlbnRpdHlCb3g
```

[JSON-RPC]: http://www.jsonrpc.org/specification

## Using with React Native

React Native does not provide `randomBytes` function and it is [required](https://github.com/dchest/tweetnacl-js/blob/master/README.md#system-requirements)
by TweetNaCl.js. In such a case you need to provide you own `randomBytes` function that is right for your system.
If you use [Expo](https://expo.io), it provides one with [expo-random](https://www.npmjs.com/package/expo-random) package.

Then you inject `randomBytes` function to telepath in `Telepath` class constructor:

```javascript
import * as Random from 'expo-random'

const randomBytes = byteCount => {
  return Random.getRandomBytesAsync(byteCount)
}

const telepath = new Telepath({ serviceUrl: 'https://idbox-queue.now.sh', randomBytes })
```

> TweetNaCl.js provides a stub for `randomBytes` and binds a correct version at runtime. If a proper `randomBytes` function
cannot be found, when you call `nacl.randomBytes` it will throw an exception. TweetNaCl.js does not seem to be
using `nacl.randomBytes` on its own.

## Not documented features

Telepath is considered a temporary solution and we aim at providing a more suitable replacement in the future. In particular we are looking for
a fully decentralized solution. Recall, that currently Telepath depends on a centralized Queueing Service. For this reason some of the developments
on the Telepath are considered temporary, and so, not fully documented. In the sections that follow we list some of them.

### Service Telepath

A Telepath has been created with one-to-one communication in mind. In this model maximum two distinct parties connect and securely exchange messages.
But what if there is a service that need to handle requests for many clients. One way to deal with this is that service has a fixed, public channel id where clients can connect. On the connection, the service creates a _transient_, ie, per-connection, telepath channel and then the further  communication continues there. This means potentially a lot of channel and because of the nature os socket.io library, where sockets are rather meant to keep connection active, it was not clear how to properly deal with disposing of the transient channels. As this is a temporary solution anyway, I have decided for a more deterministic approach: a _service telepath channel_. So when a client identifies itself with the Queuing Service it can indicate that the channel it is connecting to is a _service_ channel. This will change the communication model allowing multiple one-to-one communications to happen under single channel id. Thus, a service channel still advertises a single channel id, but now it is possible to for more than just two peers to subscribe to a channel, yet still the exchange happens only between two peers at a time. To send a message on a service channel, a peer needs to know the client id of the intended recipient, which is advertised as a so called _servicePointId_. The client id of the intended recipient is then provided as the `to` entry in the `params` object argument of the telepath `emit` operation.

Currently, the `servicePointId` is usually the same as the `clientId`, which means it should be protected in the same way as the `clientId`. Notice also that in this case the `clientId` provided in the `to` entry in the `params` object argument of the telepath `emit` operation is visible to the Queuing Service.

### Unit Testing

This module provides a test double that you can use in your unit tests. This
test double prevents real network communication from happening. It is very
limited in functionality but it will suffice for many purposes. Have a look at
`telepath-mock.js` to review the exact capabilities.

You can use the test double by creating a manual mock in your workspace. Put
a file named `telepath.js` in the folder `your-project/src/__mocks__/@identity-box`.
Inside that file, put the following statement:

```javascript
export { Telepath } from '@identity-box/telepath/source/telepath-mock'
```

## Known Limitations

Currently uses independent encryption of messages. Therefore, a recipient can not
detect if some messages have been duplicated, deleted or reordered.


[1]: https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html
[2]: https://developer.android.com/training/app-links/deep-linking.html
[3]: https://tools.ietf.org/html/rfc3986#section-2.1
[4]: https://tools.ietf.org/html/rfc4648#section-5
