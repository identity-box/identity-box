function getName (config) {
  if (process.env.APP_VARIANT === 'development') {
    return `${config.name} (Dev)`
  } else if (process.env.APP_VARIANT === 'preview') {
    return `${config.name} (Preview)`
  }
  return config.name
}

function getBundleIdentifier (config) {
  const bundleIdentifier = config.ios.bundleIdentifier
  if (process.env.APP_VARIANT === 'development') {
    return `${bundleIdentifier}.dev`
  } else if (process.env.APP_VARIANT === 'preview') {
    return `${bundleIdentifier}.preview`
  }
  return bundleIdentifier
}

function getAndroidPackage (config) {
  const androidPackage = config.android.package
  if (process.env.APP_VARIANT === 'development') {
    return `${androidPackage}.dev`
  } else if (process.env.APP_VARIANT === 'preview') {
    return `${androidPackage}.preview`
  }
  return androidPackage
}

export default ({ config }) => {
  return {
    ...config,
    name: getName(config),
    ios: {
      ...config.ios,
      bundleIdentifier: getBundleIdentifier(config)
    },
    android: {
      ...config.android,
      package: getAndroidPackage(config)
    }
  }
}
