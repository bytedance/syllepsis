module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(j|t)sx?$': 'ts-jest'
  }, 
  preset: 'jest-puppeteer',
  moduleFileExtensions: ['ts', 'tsx', 'js']
};
