module.exports = function (api) {
  const babelEnv = api.env()
  api.cache(true)

  const presets = setupPresets(babelEnv)
  const plugins = setupPlugins(babelEnv)
  const ignore = setupIgnoredFiles(babelEnv)

  return {
    presets,
    plugins,
    ignore
  }
}

function setupPresets (babelEnv) {
  let presetEnv = [
    '@babel/preset-env',
    {
      exclude: ['transform-regenerator']
    }
  ]

  if (babelEnv === 'es') {
    presetEnv = [
      '@babel/preset-env',
      {
        modules: false,
        exclude: ['transform-regenerator']
      }
    ]
  }

  return [
    presetEnv,
    [
      '@babel/preset-react',
      { runtime: 'automatic', importSource: '@emotion/react' }
    ]
  ]
}

function setupPlugins (babelEnv) {
  if (babelEnv === 'test') {
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
      ],
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties'
    ]
  } else {
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
      ],
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties'
    ]
  }
}

function setupIgnoredFiles (babelEnv) {
  let ignore

  if (babelEnv !== 'test' && babelEnv !== 'development') {
    ignore = [
      '**/*.test.js',
      '**/__mocks__/**'
    ]
  }

  return ignore
}
