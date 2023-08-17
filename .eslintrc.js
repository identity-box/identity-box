/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  globals: {
    __PATH_PREFIX__: true
  },
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: 'detect'
    },
    jest: {
      version: 27
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    requireConfigFile: false,
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'react', 'jest'],
  rules: {
    'react/prop-types': 0,
    'jsx-quotes': ['error', 'prefer-single'],
    'jest/expect-expect': 0,
    'jest/no-standalone-expect': 0,
    // Safe to disable the following rules as TSC will throw, ESLint doesn't understand interfaces properly,
    // https://github.com/eslint/typescript-eslint-parser/issues/437
    // source: https://github.com/ts-engine/ts-engine/blob/master/packages/eslint-config/index.js#L31
    'no-undef': 'off',
    // "@typescript-eslint/no-unused-vars",
    'no-unused-vars': 'off',
    'import/named': 'off',
    'import/no-unresolved': 'off',
    // we only use it in app/electron.server.ts because ignoring file does not seem to work
    '@typescript-eslint/ban-ts-comment': 'off'
  }
}
