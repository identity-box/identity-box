# @cogitojs/telepath-js

Provides a secure channel for communication between a web app running in a
 browser and an app running on a mobile device.

Setting up a secure channel between the mobile device and a browser is done
using a QR code that is presented by the web app whenever a secure channel is
required. The user can then open the secure channel by scanning the QR code
using the app on the phone.

## Description

Telepath consists of a javascript library that can be used in web apps, and an
iOS library for mobile apps.

Because both the browser and phone are likely to be behind distinct [NAT], we
use a service with a public ip address to facilitate peer-to-peer communication
between them. This is a fairly simple service that only holds end-to-end
encrypted messages in queues.

Setting up a secure channel is done using these steps:

1. The web app requests a secure connection to the mobile app by invoking the
   `createChannel` function on the javascript library.
2. The `createChannel` function generates a random channel id `I` and a
   symmetric encryption key `E`.
3. The web app displays a QR code containing the channel id `I` and key `E`.
4. The owner of the phone opens the app, points the camera to the QR code.
5. The phone app extracts the channel id and the key from the QR code.
6. Both phone and web app can now communicate on channel `I`. They encrypt/decrypt
   their messages using key `E`.

![Telepath Connection Sequence](images/telepath-connect.png)

Telepath channels supports bi-directional communication; both from the web app
to the mobile app, and vice-versa. A channel therefore consists of two queues,
which we’ve named ‘blue’ and ‘red’. The red queue is used to send messages from
the web app to the mobile app, and the blue queue is used for the reverse route.

    -------------                             ------------
    |    web    |  ---------- red ----------> |  mobile  |
    |    app    |  <--------- blue ---------- |    app   |
    -------------                             ------------

[NAT]: https://en.wikipedia.org/wiki/Network_address_translation

## QR Code

The channel id `I` and key `E` are first encoded in a URL, and then the URL is
encoded in a QR code. This allows a user to scan the QR code using the standard
camera app in iOS and be directed to the telepath-enabled mobile app.

An example of such a URL and its QR Code:

```bash
https://example.com/telepath/connect#I=2oxSJ6_eyP7JXsn6VK7ooB_u&E=m8JzVbVlEwlzzR0-o8-AU0F6oONYcqvLW5YVLvLLP6s
```

![Example QR Code](images/ExampleQRCode.png)

The URL is made up of the following components:

```bash
<base url>telepath/connect#I=<channel id>&E=<encryption key>
```

where:

* `<base url>` is the url that is registered to open the mobile app in [iOS][1]
  or [Android][2]
* `<channel id>` is the channel id string, [percent encoded][3] for use in a URL
  fragment
* `<encryption key>` is the encryption key, [base64url encoded][4]

## Usage

Add `@cogitojs/telepath-js` as a dependency:

```bash
yarn add @cogitojs/telepath-js
```

Then import `Telepath` in your own module:

```javascript
import { Telepath } from '@cogitojs/telepath-js'
```

### Creating an instance of Telepath

You create an instance of Telepath by providing the URL of the queuing
service to the `Telepath` class:

```javascript
const telepath = new Telepath('https://queuing.example.com')
```

Having an instance of `Telepath`, you can create a new channel
with a random id and a random encryption key as follows:

```javascript
const channel = await telepath.createChannel({ appName: 'My Web App' })
```

If you do not want the channel with a random id and a key, but rather recreate
the channel with the previously obtained id and the key, you can provide them
as additional attributes in the object passed to the `createChannel` method:

```javascript
const channel = await this.telepath.createChannel({
  id: channelId,
  key: channelKey,
  appName: 'My Web App'
})
```

### Obtaining a connection URL

At some point, you will need to create a QR code so that you can scan
with a mobile app and obtain the channel identifier and the symmetric
key as described above. `Telepath` provides a convenience method that given the base url
(see Section [QR Code](#qr-code) above) it return a properly formatted connection URL.
You can use this connection URL as an input to your QR code generation library.
The resulting QR code can be scanned by the mobile
app and used to connect to this channel. The telepath library does not include
functionality for displaying QR codes, you can use a QR code component such as
[qrcode.react][qrcode] for this purpose.

```javascript
const connectUrl = channel.createConnectUrl('https://example.com')
// returns: https://example.com/telepath/connect#I=<channelId>&E=<symmetricKey>
```

### Sending messages through the channel

Messages are exchanged using [JSON-RPC][json-rpc]:

```javascript
const request = { jsonrpc: '2.0', method:'test', id: 1 }
const response = await channel.send(request)
```

The `send` method returns a promise. The queuing service will be polled for a
response for at least 10 minutes. If no response is available after this time it
will return `null`.

[qrcode]: https://www.npmjs.com/package/qrcode.react
[json-rpc]: http://www.jsonrpc.org/specification

### Notifications

Telepath also supports "fire and forget"-style *notifications*. So
instead of a request-response loop, you can send a message and forget
about it, or you can register a notification handler to receive
incoming notifications.

If you want to be able to receive notifications, after creating the
Telepath channel you need to call `startNotifications` and subscribe
for notifications:

```javascript
await channel.startNotifications()
const subscription = channel.subscribeForNotifications(message => {
  console.log('received notification: ' + message)
}, error => {
  console.log('notification error: ' + error)
})
// later...
channel.unsubscribeForNotifications(subscription)
```

Sending notifications work like this (please remember that
notifications must be valid JSON-RPC 2.0 message):

```javascript
const notification = { jsonrpc: '2.0', method:'test' }
await channel.notify(notification)
```

Please note that the `channel.notify` promise being resolve only means
that the notification was sent, not that it was received by the other
party.

### Unit Testing

This module provides a test double that you can use in your unit tests. This
test double prevents real network communication from happening. It is very
limited in functionality but it will suffice for many purposes. Have a look at
`telepath-mock.js` to review the exact capabilities.

You can use the test double by creating a manual mock in your workspace. Put
a file named `telepath-js.js` in the folder `your-project/src/__mocks__/@cogitojs`.
Inside that file, put the following statement:

```javascript
export { Telepath } from '@cogitojs/telepath-js/source/telepath-mock'
```

## Known Limitations

Currently uses independent encryption of messages. A recipient can therefore not
detect if some messages have been duplicated, deleted or reordered.


[1]: https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html
[2]: https://developer.android.com/training/app-links/deep-linking.html
[3]: https://tools.ietf.org/html/rfc3986#section-2.1
[4]: https://tools.ietf.org/html/rfc4648#section-5
