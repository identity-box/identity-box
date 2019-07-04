module.exports = {
  projects: [
    'workspaces/webapp',
    'workspaces/queuing-service',
    'workspaces/telepath',
    {
      rootDir: 'workspaces/idservice',
      testEnvironment: 'node'
    },
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
