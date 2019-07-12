# queuing-service

Simple Queueing Service for use with Telepath. Allows two Telepath clients to communicate when they are behind a distinct NAT using [socket.io](https://socket.io) library.

## Usage on the server

```bash
» cd queuing-service
» yarn start
```

## Usage in the development

Queuing service can operate in a _verbose_ mode. If `NODE_ENV` is set to `development`, the queuing service will output debug info which can be very handy
during development. For the convenience, there is a script command in `package.json`:

```bash
» yarn start-dev
```
