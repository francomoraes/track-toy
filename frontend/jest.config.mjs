/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/game-core'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
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
