const path = require('path');
const fetch = require('node-fetch');
const BUNDLE_PATH = path.join(__dirname, '../index.js');
let createCommAgent;
describe('telegram-comm-agent E2E', () => {
  let server;
  beforeAll(() => {
    server = require('./mock-tg-server');
  });
  afterAll((done) => {
    server.close(done);
  });
  it('should send a message to the mock Telegram API', async () => {
    ({ createCommAgent } = require(BUNDLE_PATH));
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
            if (eventHandlers['callback_query']) {
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
      return new Proxy(mock, {
        get(target, prop) {
          if (prop in target) return target[prop];
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
    global.__MOCK_TG_MESSAGES__ = [];
    const bot = createCommAgent(createTelegrafMock, config, secrets);
    bot.launch();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(global.__MOCK_TG_MESSAGES__.length).toBeGreaterThan(0);
  });
});

