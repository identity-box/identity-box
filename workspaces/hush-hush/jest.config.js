module.exports = {
  setupFilesAfterEnv: ['./setup-tests.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  snapshotSerializers: [
    '@emotion/jest/serializer'
  ],
  modulePaths: [
    '<rootDir>/'
  ]
}
