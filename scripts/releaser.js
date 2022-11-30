const conventionalGithubReleaser = require('conventional-github-releaser');

const { GH_RELEASE_TOKEN } = process.env;

if (GH_RELEASE_TOKEN) {
  conventionalGithubReleaser(
    {
      type: 'oauth',
      token: GH_RELEASE_TOKEN,
      url: 'https://api.github.com',
    },
    {
      preset: 'angular',
      draft: true,
    },
    (err, resp) => {
      if (!err) {
        // eslint-disable-next-line no-console
        console.info('\033[32m create release draft success! \033[0m');
      } else {
        throw new Error(err);
      }
    },
  );
}
