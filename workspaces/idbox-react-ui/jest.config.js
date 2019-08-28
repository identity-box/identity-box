module.exports = {
  setupFiles: [
    'jest-canvas-mock'
  ],
  setupFilesAfterEnv: [require.resolve('./setup-tests.js')],
  modulePaths: [
    '<rootDir>/../demo-app/src/'
  ]
}
