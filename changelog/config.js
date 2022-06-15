const { readFileSync } = require('fs');
const { join } = require('path');

const logType = ['feat', 'fix', 'perf', 'revert', 'refactor'];

const showType = {
  feat: '🎉 Features',
  fix: '🐞 Bug Fixers',
  perf: '🌟 Performance Improve',
  revert: '🤚 Reverts',
  refactor: '🔨 Refactor',
};

module.exports = {
  writerOpts: {
    transform: commit => {
      const commitType = commit.type.toLowerCase();
      if (!logType.includes(commitType)) {
        return false;
      }
      commit.type = showType[commitType];
      return commit;
    },
    generateOn: commit => {
      if (!/-/.test(commit.version)) {
        return commit.version;
      }
      return false;
    },
    mainTemplate: readFileSync(join(__dirname, 'template.hbs'), 'utf-8'),
    commitPartial: readFileSync(join(__dirname, 'commit.hbs'), 'utf-8'),
  },
};
