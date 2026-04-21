const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const srcFiles = ['index.js', 'web-server.js', 'cors.js'];
const outDir = path.join(__dirname, '..', '.build');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const options = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  stringArray: true,
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  unicodeEscapeSequence: false
};

for (const f of srcFiles) {
  const srcPath = path.join(__dirname, '..', f);
  const outPath = path.join(outDir, f);
  if (!fs.existsSync(srcPath)) {
    console.warn('Skipping missing file:', srcPath);
    continue;
  }
  const src = fs.readFileSync(srcPath, 'utf8');
  const obf = JavaScriptObfuscator.obfuscate(src, options).getObfuscatedCode();
  fs.writeFileSync(outPath, obf, 'utf8');
  console.log('Wrote', outPath);
}

// Create a small entry that re-exports the obfuscated index as the module main
const entry = "module.exports = require('./index.js');\n";
fs.writeFileSync(path.join(outDir, 'entry.js'), entry, 'utf8');
console.log('Wrote .build/entry.js');

console.log('Obfuscation complete. Use require("./.build/entry.js") to load obfuscated build.');
