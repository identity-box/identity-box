const normalizeLocationPath = location => {
  const normalizedPath = location.pathname.replace(/\/$/, '')
  return {
    path: normalizedPath,
    pathWithHash: `${normalizedPath}${location.hash}`
  }
}

export { normalizeLocationPath }
