// E2E test for agent bundle using mock Telegram API
const path = require('path');
const { fork } = require('child_process');
const server = require('./mock-tg-server');
const assert = require('assert');

const BUNDLE_PATH = path.join(__dirname, '../dist/bundle-esbuild.js');

// Minimal Telegraf mock for DI
class TelegrafMock {
  constructor(token) {
    this.token = token;
    this.handlers = {};
  }
  command(cmd, fn) {
    this.handlers[cmd] = fn;
  }
  launch() {
    // Simulate receiving a /start command
    setTimeout(() => {
      if (this.handlers['start']) {
        this.handlers['start']({ reply: (msg) => {
          // Simulate sending a message to mock server
          require('node-fetch')('http://localhost:8081/bot:token/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: msg })
          });
        }});
      }
    }, 100);
  }
  stop() {}
}

(async () => {
  // Clear messages
  global.__MOCK_TG_MESSAGES__ = [];
  // Run the bundle as a child process
  const agent = fork(BUNDLE_PATH, [], {
    env: {
      ...process.env,
      TG_TOKEN: ':token',
      TG_API_BASE: 'http://localhost:8081',
      NODE_ENV: 'test'
    },
    stdio: 'inherit',
    execArgv: ['-r', 'esm']
  });

  // Wait for the agent to send a message
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check that a message was sent to the mock server
  assert(global.__MOCK_TG_MESSAGES__.length > 0, 'No messages sent to mock Telegram API');
  console.log('E2E test passed: Message sent to mock Telegram API');

  agent.kill();
  server.close();
})();
