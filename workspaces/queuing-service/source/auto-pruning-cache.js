import Cache from 'lru-cache'

export function createCache ({ maxAge = _10mins, pruneInterval = _1min } = {}) {
  const cache = new Cache({ maxAge })
  setInterval(() => { cache.prune() }, pruneInterval)
  return cache
}

const _1min = 60 * 1000
const _10mins = 10 * _1min
