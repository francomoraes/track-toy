/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/game-core'],
  testMatch: ['**/*.spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        useESM: true,
      },
    ],
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/game-core/**/*.ts', '!src/game-core/**/index.ts'],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 90,
    },
  },
};

export default config;
