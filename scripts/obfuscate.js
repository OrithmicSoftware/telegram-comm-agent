// Obfuscate the esbuild bundle using javascript-obfuscator
const fs = require('fs');
const path = require('path');
const obfuscator = require('javascript-obfuscator');

const bundlePath = path.join(__dirname, '../dist/telegram-comm-agent.min.js');
const code = fs.readFileSync(bundlePath, 'utf8');


const obfuscated = obfuscator.obfuscate(code, {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 1,
  selfDefending: true,
  disableConsoleOutput: true
});

fs.writeFileSync(bundlePath, obfuscated.getObfuscatedCode(), 'utf8');
console.log('Obfuscation complete:', bundlePath);
