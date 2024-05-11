// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintPluginImport from 'eslint-plugin-import'
import eslintConfigPrettier from 'eslint-config-prettier'
import jest from 'eslint-plugin-jest'

import { FlatCompat } from '@eslint/eslintrc'
const compat = new FlatCompat()

const reactRecommended = {
  ...reactPlugin.configs.recommended
}

delete reactRecommended.parserOptions
delete reactRecommended.plugins

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('eslint-config-standard'),
  eslintConfigPrettier,
  {
    ignores: [
      '**/dist',
      '**/public',
      '**/.cache',
      '**/.next',
      '**/.expo',
      'workspaces/cli-tools/test-ipfs-http-client.js',
      'workspaces/idapp/__mocks__',
      'workspaces/idapp/index.js',
      '**/workspaces/idapp/metro.config.js',
      'workspaces/idapp/babel.config.js'
    ]
  },
  {
    files: ['**/*.test.js'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/expect-expect': 0,
      'jest/no-standalone-expect': 0
    }
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    ...reactRecommended,
    languageOptions: {
      ...reactPlugin.configs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: eslintPluginImport
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'react/prop-types': 0,
      'jsx-quotes': ['error', 'prefer-single'],
      // Safe to disable the following rules as TSC will throw, ESLint doesn't understand interfaces properly,
      // https://github.com/eslint/typescript-eslint-parser/issues/437
      // source: https://github.com/ts-engine/ts-engine/blob/master/packages/eslint-config/index.js#L31
      'no-undef': 'off',
      // "@typescript-eslint/no-unused-vars",
      'no-unused-vars': 'off',
      'import/named': 'off',
      'import/no-unresolved': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      },
      jest: {
        version: 'detect'
      }
    }
  }
]
