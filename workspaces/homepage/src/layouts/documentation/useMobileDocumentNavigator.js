import { useState, useEffect } from 'react'
import { navigate } from 'gatsby'

import { normalizeLocationPath } from './normalizeLocationPath'

const useMobileDocumentNavigator = ({
  onNewPathSelected,
  location
}, deps) => {
  const [prevLocation, setPrevLocation] = useState()

  const navigateUnusually = ({ path, pathWithHash }) => {
    setTimeout(() => {
      setPrevLocation(pathWithHash)
      navigate(pathWithHash)
    }, 300)
    setPrevLocation(path)
    navigate(path)
  }

  useEffect(() => {
    const { path, pathWithHash } = normalizeLocationPath(location)

    if (!prevLocation) {
      setPrevLocation(pathWithHash)
    } else if (prevLocation !== pathWithHash) {
      navigateUnusually({ path, pathWithHash })
      onNewPathSelected && onNewPathSelected()
    }
  }, deps)
}

export { useMobileDocumentNavigator }
