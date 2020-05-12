module.exports = {
  projects: [
    'workspaces/idbox-react-ui',
    'workspaces/hush-hush',
    {
      rootDir: 'workspaces/queuing-service',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/telepath',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/utils',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/idservice',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/nameservice',
      testEnvironment: 'node'
    },
    {
      rootDir: 'workspaces/identity-service',
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
