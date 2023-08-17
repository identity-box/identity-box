import { RendezvousTunnel } from '@identity-box/rendezvous-client'
import type { RendezvousMessage } from '@identity-box/rendezvous-client'
import { randomBytes } from '~/crypto'

type RendezvousTunnelDescriptor = {
  url: string
  tunnelId: string
  onReady?: (tunnel: RendezvousTunnel) => void
  onMessage?: (msg: RendezvousMessage) => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

class GlobalRendezvousTunnelKeeper {
  static _instances: Record<string, RendezvousTunnel> = {}

  static instance = ({ tunnelId, url }: { tunnelId: string; url: string }) => {
    return this._instances[`${url}:${tunnelId}`]
  }

  static createNewTunnelInstance = ({
    url,
    tunnelId,
    onReady,
    onMessage,
    onEnd,
    onError
  }: RendezvousTunnelDescriptor) => {
    try {
      const tunnel = new RendezvousTunnel({
        baseUrl: url,
        onMessage: (msg: RendezvousMessage) => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onTunnelReady: () => {
          onReady && onReady(tunnel)
        },
        onTunnelClosed: async () => {
          console.log('Tunnel closed!')
          delete this._instances[`${url}:${tunnelId}`]
          onEnd && onEnd()
        },
        prng: randomBytes
      })
      if (!tunnel) {
        throw new Error('fatal error: failed when creating tunnel!')
      }
      this._instances[`${url}:${tunnelId}`] = tunnel
      return tunnel
    } catch (e: unknown) {
      delete this._instances[`${url}:${tunnelId}`]
      if (e instanceof Error) {
        console.log(e.message)
        onError && onError(e)
      } else {
        console.log('unknown error')
        onError && onError(new Error('unknown error'))
      }
    }
  }

  static connect = ({ url, tunnelId, onError }: RendezvousTunnelDescriptor) => {
    try {
      const tunnel = this._instances[`${url}:${tunnelId}`]
      if (!tunnel) {
        throw new Error(
          `error: tunnel with tunnelId=${tunnelId} and url=${url} does not exist! Did you forget to call GlobalRendezvousTunnelKeeper::createNewTunnelInstance?`
        )
      }
      tunnel.connectToExisting(tunnelId)
    } catch (e: unknown) {
      delete this._instances[`${url}:${tunnelId}`]
      if (e instanceof Error) {
        console.log(e.message)
        onError && onError(e)
      } else {
        console.log('unknown error')
        onError && onError(new Error('unknown error'))
      }
    }
  }

  static disconnect = ({
    url,
    tunnelId
  }: {
    url: string
    tunnelId: string
  }) => {
    const tunnel = this.instance({ url, tunnelId })
    if (tunnel) {
      tunnel.closeLocalConnection()
      delete this._instances[`${url}:${tunnelId}`]
    }
  }
}

export type { RendezvousTunnelDescriptor }
export { GlobalRendezvousTunnelKeeper }
