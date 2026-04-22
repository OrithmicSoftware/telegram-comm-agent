const { createCommAgent } = require('../index');

describe('telegram-comm-agent: Step Flow', () => {
  let bot;
  let replies;
  let secrets;
  let config;
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
    bot = createCommAgent(TelegrafMock, config, secrets);
    replies = [];
    bot.telegram.callApi = jest.fn(() => Promise.resolve(true));
    bot.context.reply = (msg, opts) => replies.push({ msg, opts });
  });

  it('should create a bot and walk through the FLOW prompts', async () => {
    const validSecrets = { BOT_TOKEN: 'dummy', ADMIN_CHAT_ID: '111', AGENT_CHAT_ID: '222', FORWARD_TO_AGENT: 'no' };
    const validBot = createCommAgent(TelegrafMock, config, validSecrets);
    const flow = config.STRINGS.FLOW;
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    validBot.context = { from: user, message: { text: Object.values(config.SERVICES)[0] }, reply: (msg, opts) => replies.push({ msg, opts }) };
    for (let i = 0; i < flow.length; i++) {
      validBot.context.from = user;
      validBot.context.message = { text: `answer${i}` };
      await validBot.context.reply(flow[i].prompt);
    }
    expect(replies.map(r => r.msg)).toContain(flow[0].prompt);
    expect(replies.map(r => r.msg)).toContain(flow[1].prompt);
  });
});
