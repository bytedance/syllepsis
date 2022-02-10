const spawn = require('child_process').spawnSync;

const sp = spawn('git', ['diff', '--name-only']);

sp.stdout.on('data', data => {
  if (data.toString().includes('CHANGELOG.md')) {
    spawn('git', ['add', 'CHANGELOG.md']);

    spawn('git', ['commit', '-m', 'docs: update CHANGELOG']);
  }
});
