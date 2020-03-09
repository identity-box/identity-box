module.exports = {
  projects: [
    'workspaces/hush-hush',
    'workspaces/queuing-service',
    'workspaces/telepath',
    'workspaces/idbox-react-ui',
    'workspaces/utils',
    {
      rootDir: 'workspaces/idservice',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/nameservice',
      testEnvironment: 'node'
    },
    {
      testMatch: ['<rootDir>/dummy']
    }
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'source/**/*.js',
    'src/**/*.js',
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
