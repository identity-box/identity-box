module.exports = {
  setupFiles: [
    'jest-canvas-mock'
  ],
  snapshotSerializers: [
    '@emotion/jest/serializer'
  ],
  setupFilesAfterEnv: ['./setup-tests.js'],
  testEnvironment: 'jsdom'
}
