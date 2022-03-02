const { spawn, spawnSync } = require('child_process');

const sp = spawn('git', ['diff', '--name-only']);

sp.stdout.on('data', data => {
  if (data.toString().includes('CHANGELOG.md')) {
    spawnSync('git', ['add', 'CHANGELOG.md']);

    spawnSync('git', ['commit', '-m', 'docs: update CHANGELOG']);
  }
});
