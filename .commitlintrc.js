module.exports = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'subject-case': [0, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
    ],
    'prefer-english': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'prefer-english': ({ subject }) => [
          subject ? !/[\u4e00-\u9fa5]/g.test(subject.trim()) : true,
          'please translate your commit message into English',
        ],
      },
    },
  ],
};
