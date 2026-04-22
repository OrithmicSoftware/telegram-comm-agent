const { createCommAgent } = require('../index');
const { createLeadWebServer } = require('../web-server');
const request = require('supertest');

describe('telegram-comm-agent: Bot Integration', () => {
  let config;
  let secrets;
  let replies;
  let userId = 12345;

  function TelegrafMock() {
    return {
      on: jest.fn(() => this),
      hears: jest.fn(() => this),
      start: jest.fn(() => this),
      launch: jest.fn(),
      stop: jest.fn(),
      telegram: { callApi: jest.fn(() => Promise.resolve(true)), sendMessage: jest.fn(() => Promise.resolve(true)) },
      context: { reply: (msg, opts) => replies.push({ msg, opts }) },
      handleUpdate: jest.fn(),
    };
  }
  beforeEach(() => {
    config = {
      SERVICES: { pizza: '🍕 Pizza Delivery' },
      STRINGS: {
        WELCOME: 'Welcome!',
        CHOOSE_SERVICE: 'Choose service:',
        CONTACT_PROMPT: 'Contact info:',
        INVALID_SERVICE: 'Invalid service.',
        LEAD_SENT: 'Lead sent.',
        MSG_SENT: 'Message sent.',
        LEAD_TEMPLATE: (collected, _user) => `Lead: ${collected.service}, ${collected.name}`,
        MSG_TEMPLATE: (_user, text) => `Message: ${text}`,
        APPROVE_BTN: 'Approve',
        REJECT_BTN: 'Reject',
        FLOW: [
          { field: 'name', prompt: 'Your name?' },
          { field: 'phone', prompt: 'Your phone?' },
        ],
      },
      BUTTONS: { SERVICE_LIST: 'List Services', CONTACT: 'Contact' },
    };
    secrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    function TelegrafMock() {
      return {
        on: jest.fn(() => this),
        hears: jest.fn(() => this),
        start: jest.fn(() => this),
        launch: jest.fn(),
        stop: jest.fn(),
        telegram: { callApi: jest.fn(() => Promise.resolve(true)), sendMessage: jest.fn(() => Promise.resolve(true)) },
        context: { reply: (msg, opts) => replies.push({ msg, opts }) },
        handleUpdate: jest.fn(),
      };
    }
    createCommAgent(TelegrafMock, config, secrets);
    // Mock launch and stop to avoid network calls
    replies = [];
  });


  it('should forward lead to both admin and agent when FORWARD_TO_AGENT is "all"', async () => {
    const secretsAll = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'all' };
    const botAll = createCommAgent(TelegrafMock, config, secretsAll);
    botAll.telegram.sendMessage = jest.fn(() => Promise.resolve(true));
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    // Simulate a completed flow (lead)
    const collected = { service: Object.keys(config.SERVICES)[0], name: 'answer0', phone: 'answer1' };
    const leadMsg = config.STRINGS.LEAD_TEMPLATE(collected, user);
    await botAll.telegram.sendMessage('111', leadMsg);
    await botAll.telegram.sendMessage('222', leadMsg);
    expect(botAll.telegram.sendMessage).toHaveBeenCalledWith('111', expect.stringContaining('Lead'));
    expect(botAll.telegram.sendMessage).toHaveBeenCalledWith('222', expect.stringContaining('Lead'));
  });

  it('should forward fallback message to both admin and agent when FORWARD_TO_AGENT is "all"', async () => {
    const secretsAll = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'all' };
    const botAll = createCommAgent(TelegrafMock, config, secretsAll);
    botAll.telegram.sendMessage = jest.fn(() => Promise.resolve(true));
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    const msg = config.STRINGS.MSG_TEMPLATE(user, 'random message');
    await botAll.telegram.sendMessage('111', msg);
    await botAll.telegram.sendMessage('222', msg);
    expect(botAll.telegram.sendMessage).toHaveBeenCalledWith('111', expect.stringContaining('Message'));
    expect(botAll.telegram.sendMessage).toHaveBeenCalledWith('222', expect.stringContaining('Message'));
  });

  it('should handle missing secrets', () => {
    // Provide undefined instead of {} to simulate missing secrets
    expect(() => createCommAgent(config, undefined)).toThrow();
  });

  it('should reply to /start with welcome', async () => {
    const validSecrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    const validBot = createCommAgent(TelegrafMock, config, validSecrets);
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: '/start' } };
    await validBot.handleUpdate({ message: { ...ctx.message, from: ctx.from } }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.WELCOME, expect.anything());
  });

  it('should handle service selection and flow', async () => {
    const validSecrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    const validBot = createCommAgent(TelegrafMock, config, validSecrets);
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: config.BUTTONS.SERVICE_LIST } };
    await validBot.handleUpdate({ message: { ...ctx.message, from: ctx.from } }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.CHOOSE_SERVICE, expect.anything());
  });

  it('should handle contact prompt', async () => {
    const validSecrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    const validBot = createCommAgent(TelegrafMock, config, validSecrets);
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: config.BUTTONS.CONTACT } };
    await validBot.handleUpdate({ message: { ...ctx.message, from: ctx.from } }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.CONTACT_PROMPT, expect.anything());
  });

  it('should handle invalid service', async () => {
    const validSecrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    const validBot = createCommAgent(TelegrafMock, config, validSecrets);
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: 'Invalid Service' } };
    await validBot.handleUpdate({ message: ctx.message }, ctx);
    expect(ctx.reply).not.toHaveBeenCalledWith(config.STRINGS.CHOOSE_SERVICE, expect.anything());
  });
});

describe('telegram-comm-agent: Web Server', () => {
  let app;
  let sentMessages;
  beforeEach(() => {
    sentMessages = [];
    const fakeBot = {
      telegram: {
        sendMessage: jest.fn((chatId, msg) => {
          sentMessages.push({ chatId, msg });
          return Promise.resolve(true);
        }),
      },
    };
    app = createLeadWebServer({
      BOT_TOKEN: 'dummy',
      ADMIN_CHAT_ID: '111',
      AGENT_CHAT_ID: '222',
      botInstance: fakeBot,
      formatLead: ({ name, phone, message }) => `Lead: ${name}, ${phone}, ${message}`,
      port: 0, // do not actually listen
    });
  });

  it('should accept /lead POST and forward to Telegram', async () => {
    const res = await request(app)
      .post('/lead')
      .send({ name: 'Test', phone: '123', message: 'Hello' });
    expect(res.body.ok).toBe(true);
    expect(sentMessages.length).toBe(2);
    expect(sentMessages[0].msg).toContain('Test');
  });

  it('should handle Telegram send error', async () => {
    // Suppress expected error log for clean test output
    const origError = console.error;
    console.error = jest.fn();
    app = createLeadWebServer({
      BOT_TOKEN: 'dummy',
      ADMIN_CHAT_ID: '111',
      AGENT_CHAT_ID: '222',
      botInstance: {
        telegram: {
          sendMessage: jest.fn(() => Promise.reject(new Error('fail'))),
        },
      },
      port: 0,
    });
    const res = await request(app)
      .post('/lead')
      .send({ name: 'Test', phone: '123', message: 'Hello' });
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe('fail');
    console.error = origError;
  });
});
