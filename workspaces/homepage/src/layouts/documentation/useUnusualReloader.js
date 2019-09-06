import { useState, useEffect } from 'react'
import { navigate } from 'gatsby'
import { normalizeLocationPath } from './normalizeLocationPath'

const useUnusualReloader = location => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { path, pathWithHash } = normalizeLocationPath(location)

    setTimeout(() => {
      setReady(true)
      navigate(pathWithHash, { replace: true })
    }, 300)
    navigate(path, { replace: true })
  }, [])

  return ready
}

export { useUnusualReloader }
