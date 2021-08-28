module.exports = {
  setupFiles: [
    'jest-canvas-mock'
  ],
  snapshotSerializers: [
    '@emotion/jest/serializer'
  ],
  setupFilesAfterEnv: [require.resolve('./setup-tests.js')],
  testEnvironment: 'jsdom'
}
