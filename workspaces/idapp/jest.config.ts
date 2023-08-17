import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  }
}

export default jestConfig
