module.exports = {
  projects: [
    'workspaces/home-page',
    'workspaces/queuing-service',
    'workspaces/telepath',
    {
      testMatch: ['<rootDir>/dummy']
    }
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'source/*.js',
    'pages/*.js',
    'components/**',
    '!pages/_app.js',
    '!**/jest.config.js',
    '!**/_document.js',
    '!**/*.test.js',
    '!**/__mocks__/**.js',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  coverageReporters: [
    'text-summary',
    'lcov'
  ]
}
