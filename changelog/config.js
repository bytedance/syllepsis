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
		transform: (commit) => {
			if (!logType.includes(commit.type)) {
				return false;
			}
			commit.type = showType[commit.type];
			return commit;
		},
		generateOn: (commit) => {
			if (!/-/.test(commit.version)) {
				return commit.version;
			}
			return false;
		},
		mainTemplate: readFileSync(join(__dirname, 'template.hbs'), 'utf-8'),
		commitPartial: readFileSync(join(__dirname, 'commit.hbs'), 'utf-8'),
	},
};
