import { useState, useEffect } from 'react'
import { navigate } from 'gatsby'

const normalizaLocationPath = location => {
  const normalizedPath = location.pathname.replace(/\/$/, '')
  return {
    path: normalizedPath,
    pathWithHash: `${normalizedPath}${location.hash}`
  }
}

const useMobileDocumentNavigator = ({
  disableScrollRestoration,
  onNewPathSelected,
  onNoNewPathSelected,
  location
}, excl) => {
  const [ prevLocation, setPrevLocation ] = useState()

  const navigateUnusually = ({ path, pathWithHash }) => {
    setTimeout(() => {
      setPrevLocation(pathWithHash)
      navigate(pathWithHash)
    }, 300)
    setPrevLocation(path)
    navigate(path)
  }

  useEffect(() => {
    const { path, pathWithHash } = normalizaLocationPath(location)

    if (!prevLocation) {
      disableScrollRestoration()
      setPrevLocation(pathWithHash)
      onNoNewPathSelected && onNoNewPathSelected()
      return
    }

    if (prevLocation !== pathWithHash) {
      disableScrollRestoration()

      onNewPathSelected && onNewPathSelected()

      navigateUnusually({ path, pathWithHash })
      return
    }

    onNoNewPathSelected && onNoNewPathSelected()
  }, excl)
}

export { useMobileDocumentNavigator }
