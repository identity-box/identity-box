module.exports = {
  setupFilesAfterEnv: ['./setup-tests.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  modulePaths: [
    '<rootDir>/'
  ]
}
