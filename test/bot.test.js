const { createCommAgent } = require('../index');
const { createLeadWebServer } = require('../web-server');
const request = require('supertest');

describe('telegram-comm-agent: Bot Integration', () => {
  let bot;
  let config;
  let secrets;
  let replies;
  let userId = 12345;

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
        LEAD_TEMPLATE: (collected, user) => `Lead: ${collected.service}, ${collected.name}`,
        MSG_TEMPLATE: (user, text) => `Message: ${text}`,
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
    bot = createCommAgent(config, secrets);
    replies = [];
    bot.telegram.callApi = jest.fn(() => Promise.resolve(true));
    bot.context.reply = (msg, opts) => replies.push({ msg, opts });
  });

  it('should launch and stop the bot without error', async () => {
    expect(() => bot.launch()).not.toThrow();
    expect(() => bot.stop('SIGINT')).not.toThrow();
  });

  it('should handle missing secrets', () => {
    expect(() => createCommAgent(config, {})).toThrow();
  });

  it('should reply to /start with welcome', async () => {
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: '/start' } };
    await bot.handleUpdate({ message: ctx.message }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.WELCOME, expect.anything());
  });

  it('should handle service selection and flow', async () => {
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: config.BUTTONS.SERVICE_LIST } };
    await bot.handleUpdate({ message: ctx.message }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.CHOOSE_SERVICE, expect.anything());
  });

  it('should handle contact prompt', async () => {
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: config.BUTTONS.CONTACT } };
    await bot.handleUpdate({ message: ctx.message }, ctx);
    expect(ctx.reply).toHaveBeenCalledWith(config.STRINGS.CONTACT_PROMPT, expect.anything());
  });

  it('should handle invalid service', async () => {
    const ctx = { reply: jest.fn(), from: { id: userId }, message: { text: 'Invalid Service' } };
    await bot.handleUpdate({ message: ctx.message }, ctx);
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
  });
});
