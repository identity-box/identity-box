module.exports = function (api) {
  const babelEnv = api.env()
  api.cache(true)

  console.log('babelEnv=', babelEnv)

  const presets = setupPresets(babelEnv)
  const plugins = setupPlugins(babelEnv)

  return {
    presets,
    plugins
  }
}

function setupPresets (babelEnv) {
  return [
    [
      'next/babel', {
        'preset-env': {
          modules: false,
          targets: ['> 0.25%, not dead']
        },
        'preset-react': {
          runtime: 'automatic',
          importSource: '@emotion/react'
        }
      }
    ]
  ]
}

function setupPlugins (babelEnv) {
  return [
    [
      '@emotion',
      {
        // sourceMap is on by default but source maps are dead code eliminated in production
        sourceMap: true,
        autoLabel: 'dev-only',
        labelFormat: '[local]',
        cssPropOptimization: true
      }
    ]
  ]
}
