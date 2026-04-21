#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd) {
  console.log('> ', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

// parse --mode=both|bundle|perfile (default both)
const arg = process.argv.slice(2).find(a => a.startsWith('--mode='));
const mode = arg ? arg.split('=')[1] : 'both';

if (!['both', 'bundle', 'perfile'].includes(mode)) {
  console.error('Invalid mode:', mode);
  process.exit(2);
}

try {
  if (mode === 'both' || mode === 'perfile') {
    run('node scripts/build-obfuscate.js');
  }
  if (mode === 'both' || mode === 'bundle') {
    run('node scripts/build-bundle.js');
  }
  console.log('Build finished (mode=' + mode + ').');
} catch (err) {
  console.error('Build failed.', err);
  process.exit(1);
}
