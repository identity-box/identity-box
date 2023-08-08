type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type RendezvousMessage = {
  method: string
  params: Array<Json>
}

export type { RendezvousMessage }
