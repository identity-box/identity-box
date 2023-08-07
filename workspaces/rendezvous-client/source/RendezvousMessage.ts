type Json = string | number
type JsonArray = Array<string> | Array<number>

type RendezvousMessage = {
  method: string
  params: Array<Record<string, Json | JsonArray>>
}

export type { RendezvousMessage }
