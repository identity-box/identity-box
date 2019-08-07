import { useState, useRef } from 'react'

const useScrollResoration = () => {
  const [enabled, setEnabled] = useState(false)
  const scrollPos = useRef(null)

  const recordScrollPosition = () => {
    scrollPos.current = document.documentElement.scrollTop || document.body.scrollTop
    setEnabled(true)
  }

  const restoreScrollPosition = () => {
    if (enabled) {
      document.documentElement.scrollTop = document.body.scrollTop = scrollPos.current
    }
  }

  const disableScrollRestoration = () => {
    setEnabled(false)
  }

  return {
    recordScrollPosition,
    restoreScrollPosition,
    disableScrollRestoration
  }
}

export { useScrollResoration }
