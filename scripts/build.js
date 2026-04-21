// Build with esbuild, marking telegraf as external
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.join(__dirname, '../index.js')],
  bundle: true,
  minify: true,
  platform: 'node',
  target: ['node16'],
  outfile: path.join(__dirname, '../dist/telegram-comm-agent.min.js'),
  external: ['telegraf'], // Do not bundle telegraf
}).then(() => {
  console.log('esbuild bundle complete (telegraf external, output: telegram-comm-agent.min.js).');
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
