const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const srcFiles = ['index.js', 'web-server.js', 'cors.js'];
const outDir = path.join(__dirname, '..', '.build');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function readSrc(name) {
  const p = path.join(__dirname, '..', name);
  if (!fs.existsSync(p)) throw new Error('Missing source ' + p);
  return fs.readFileSync(p, 'utf8');
}

// Build a simple CommonJS module bundle where each file is a module id.
const modules = {};
for (const f of srcFiles) {
  const src = readSrc(f);
  // wrap source in a function
  modules[f] = `(function(module,exports,require){\n${src}\n})`;
}

// bundle template
let bundle = `// Bundled telegram-comm-agent single-file build
(function(){
  var __modules = {\n`;

for (const [k, v] of Object.entries(modules)) {
  bundle += `    ${JSON.stringify(k)}: ${v},\n`;
}

bundle += `  };

  var __cache = {};
  function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    if (!__modules[id]) throw new Error('Module not found: ' + id);
    var module = { exports: {} };
    __cache[id] = module;
    __modules[id](module, module.exports, __require);
    return module.exports;
  }

  // export the main module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = __require('index.js');
  } else {
    this['telegramCommAgentBundled'] = __require('index.js');
  }
})();
`;

// Obfuscate the bundle for distribution
const obfOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.8,
  stringArray: true,
  stringArrayThreshold: 0.8,
  rotateStringArray: true
};

const obf = JavaScriptObfuscator.obfuscate(bundle, obfOptions).getObfuscatedCode();
const outPath = path.join(outDir, 'bundle.js');
fs.writeFileSync(outPath, obf, 'utf8');
console.log('Wrote', outPath);

console.log('Bundle complete. Use require("./.build/bundle.js") to load single-file obfuscated library.');
