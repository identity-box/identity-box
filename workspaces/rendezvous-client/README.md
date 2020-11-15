# Rendezvous Client

Rendezvous Client package provides two abstractions: `RendezvousClient` and `RendezvousTunnel`.

## RendezvousClient

`RendezvousClient` facilitates secure connection between a browser (or mobile if javascript code is run, e.g. with React Native) and the [Rendezvous](https://idbox.online/services/rendezvous) service.

## RendezvousTunnel

`RendezvousTunnel` creates a secure connection between two clients (e.g. browser to browser or browser to mobile if e.g. React Native is used) using a [Rendezvous](https://idbox.online/services/rendezvous) service on an Identity Box with the given url.
