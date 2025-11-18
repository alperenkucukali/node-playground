const base = require('./jest.config.js');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  moduleFileExtensions: base.moduleFileExtensions,
  testMatch: ['**/tests/integration/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/integration/setup-env.js'],
  testTimeout: 60000,
};
