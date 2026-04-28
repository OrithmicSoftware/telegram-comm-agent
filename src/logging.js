const fs = require('fs');
const path = require('path');

// Simple log rotation: if log file > 1MB, rotate to .1, .2, keep max 3 files
function rotateLogFile(logFile) {
  if (!fs.existsSync(logFile)) return;
  const stats = fs.statSync(logFile);
  if (stats.size < 1024 * 1024) return;
  for (let i = 2; i >= 0; i--) {
    const src = i === 0 ? logFile : `${logFile}.${i}`;
    const dest = `${logFile}.${i + 1}`;
    if (fs.existsSync(src)) {
      if (i === 2) fs.unlinkSync(src);
      else fs.renameSync(src, dest);
    }
  }
}

function initLogging({ logFile = 'bot-log.txt', maxLogLines = 200, enable = false, logDir = process.cwd() } = {}) {
  if (!enable) return;
  const fullLogFile = path.isAbsolute(logFile) ? logFile : path.join(logDir, logFile);
  let logBuffer = [];
  const origLog = console.log;
  const origErr = console.error;
  function logLine(line) {
    const ts = new Date().toISOString();
    const entry = `[${ts}] ${line}`;
    logBuffer.push(entry);
    if (logBuffer.length > maxLogLines) logBuffer.shift();
    rotateLogFile(fullLogFile);
    fs.appendFileSync(fullLogFile, entry + '\n');
  }
  console.log = (...args) => { origLog(...args); logLine(args.join(' ')); };
  console.error = (...args) => { origErr(...args); logLine('[ERROR] ' + args.join(' ')); };
  return {
    getLogBuffer: () => [...logBuffer],
    logFile: fullLogFile
  };
}

module.exports = { initLogging };
