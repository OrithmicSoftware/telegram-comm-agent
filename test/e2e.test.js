console.log('TEST FILE EXECUTED');
// E2E test for agent bundle using mock Telegram API
const path = require('path');

const server = require('./mock-tg-server');
const assert = require('assert');
const BUNDLE_PATH = path.join(__dirname, '../index.js');
let createCommAgent;
try {
  ({ createCommAgent } = require(BUNDLE_PATH));
  console.log('REQUIRE SUCCESSFUL');
} catch (e) {
  console.error('REQUIRE FAILED', e);
  process.exit(1);
}
const fetch = require('node-fetch');

// Minimal Telegraf mock for DI


function createTelegrafMock(token) {
  const handlers = {};
  const eventHandlers = {};
  const mock = {
    token,
    command(cmd, fn) { handlers[cmd] = fn; },
    on(event, fn) { eventHandlers[event] = fn; },
    start(fn) { handlers['start'] = fn; },
    launch() {
      setTimeout(() => {
        // Simulate /start command
        if (handlers['start']) {
          handlers['start']({
            reply: (msg) => {
              fetch('http://localhost:8081/bot:token/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: msg })
              });
            },
            from: { id: 1, username: 'testuser' },
            message: { text: '/start' },
            telegram: { sendMessage: () => {} }
          });
        }
        // Simulate text event
        if (eventHandlers['text']) {
          eventHandlers['text']({
            reply: (msg) => {
              fetch('http://localhost:8081/bot:token/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: msg })
              });
            },
            from: { id: 1, username: 'testuser' },
            message: { text: 'Hello' },
            telegram: { sendMessage: () => {} }
          });
        }
        // Simulate callback_query event
        if (eventHandlers['callback_query']) {
          // Provide callbackQuery (capital Q) with .data, matching the agent's expectation
          const cbq = {
            data: 'approve:1',
            from: { id: 1, username: 'testuser' },
            message: { text: 'approve:1' },
            answerCbQuery: () => {}
          };
          const ctx = {
            callbackQuery: cbq,
            callback_query: cbq,
            editMessageReplyMarkup: () => Promise.resolve(),
            answerCbQuery: () => Promise.resolve(),
            reply: (msg) => {
              fetch('http://localhost:8081/bot:token/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: msg })
              });
            },
            telegram: { sendMessage: () => {} }
          };
          eventHandlers['callback_query'](ctx);
        }
      }, 100);
    },
    stop() {}
  };
  // Proxy to handle dynamic method calls (e.g., .SERVICE_LIST(fn))
  return new Proxy(mock, {
    get(target, prop) {
      if (prop in target) return target[prop];
      // If a handler is being registered (e.g., .SERVICE_LIST(fn)), store it
      return function(fn) { handlers[prop] = fn; };
    }
  });
}

const config = {
  STRINGS: {
    WELCOME: 'Welcome!',
    CHOOSE_SERVICE: 'Choose a service:',
    CONTACT_PROMPT: 'Contact us!',
    INVALID_SERVICE: 'Invalid service.',
    CONFIG_ERROR_USER: 'Config error.',
    CONFIG_ERROR_ADMIN_PREFIX: 'Config error:',
    LEAD_TEMPLATE: () => 'Lead!',
    MSG_TEMPLATE: () => 'Message!',
    LEAD_SENT: 'Lead sent!',
    MSG_SENT: 'Message sent!',
    APPROVED_CB: 'Approved!',
    REJECTED_CB: 'Rejected!',
    UNKNOWN_CB: 'Unknown!',
    APPROVE_BTN: 'Approve',
    REJECT_BTN: 'Reject',
    FLOW: []
  },
  BUTTONS: {
    SERVICE_LIST: 'Service List',
    CONTACT: 'Contact'
  },
  SERVICES: {},
  SERVICE_FLOW_MAP: {},
  STEP_FLOWS: {},
  STEP_DEFS: {}
};

const secrets = {
  BOT_TOKEN: ':token',
  ADMIN_CHAT_ID: 1,
  AGENT_CHAT_ID: 2
};

console.log('INSIDE ASYNC');
(async () => {
  global.__MOCK_TG_MESSAGES__ = [];
  console.log('DEBUG (before launch) __MOCK_TG_MESSAGES__:', global.__MOCK_TG_MESSAGES__);
  const bot = createCommAgent(createTelegrafMock, config, secrets);
  console.log('DEBUG after createCommAgent');
  bot.launch();
  console.log('DEBUG after bot.launch');
  await new Promise((resolve) => { setTimeout(() => { console.log('DEBUG after setTimeout'); resolve(); }, 500); });
  console.log('DEBUG (after wait) __MOCK_TG_MESSAGES__:', global.__MOCK_TG_MESSAGES__);
  assert(global.__MOCK_TG_MESSAGES__.length > 0, 'No messages sent to mock Telegram API');
  console.log('E2E test passed: Message sent to mock Telegram API');
  server.close();
})();

