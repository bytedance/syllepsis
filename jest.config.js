module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(j|t)sx?$': 'ts-jest',
  },
  preset: 'jest-puppeteer',
  setupFiles: ['<rootDir>/test/mock/client.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/test/mock/style.js',
  },
};
