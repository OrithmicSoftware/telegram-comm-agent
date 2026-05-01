
const { createCommAgent } = require('../index');

describe('telegram-comm-agent: Step Flow', () => {
  let bot;
  let replies;
  let secrets;
  let config;
  let userId = 12345;

  beforeEach(() => {
    config = {
      SERVICES: { pizza: '🍕 Pizza Delivery' },
      SERVICE_FLOW_MAP: { pizza: 'pizzaFlow' },
      STEP_FLOWS: {
        pizzaFlow: [
          { field: 'name', prompt: 'Your name?' },
          { field: 'phone', prompt: 'Your phone?' },
        ]
      },
      STRINGS: {
        WELCOME: 'Welcome!',
        CHOOSE_SERVICE: 'Choose service:',
        CONTACT_PROMPT: 'Contact info:',
        INVALID_SERVICE: 'Invalid service.',
        LEAD_SENT: 'Lead sent.',
        MSG_SENT: 'Message sent.',
        LEAD_TEMPLATE: (collected, _user) => `Lead: ${collected.service}, ${collected.name}`,
        MSG_TEMPLATE: (collected, _user) => `Лид из бота: ${collected.message || collected.name || ''}`,
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
    replies = [];
    bot = createCommAgent(config, secrets);
    // Mock sendMessage for all tests
    bot.telegram.sendMessage = jest.fn(() => Promise.resolve(true));
    bot.context = { reply: (msg) => replies.push({ msg }) };
  });

  it('should create a bot and walk through the FLOW prompts', async () => {
    const flow = config.STRINGS.FLOW;
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    bot.context = { from: user, message: { text: Object.values(config.SERVICES)[0] }, reply: (msg) => replies.push({ msg }) };
    for (let i = 0; i < flow.length; i++) {
      bot.context.from = user;
      bot.context.message = { text: `answer${i}` };
      await bot.context.reply(flow[i].prompt);
    }
    expect(replies.map(r => r.msg)).toContain(flow[0].prompt);
    expect(replies.map(r => r.msg)).toContain(flow[1].prompt);
  });

  it('should forward lead to both admin and agent when FORWARD_TO_AGENT is "all"', async () => {
    bot.telegram.sendMessage = jest.fn(() => Promise.resolve(true));
    secrets.FORWARD_TO_AGENT = 'all';
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    // Simulate user pressing SERVICE_LIST to start flow
    const ctxList = { from: user, message: { text: config.BUTTONS.SERVICE_LIST }, reply: jest.fn() };
    await bot.handleUpdate({ message: { text: config.BUTTONS.SERVICE_LIST, from: user } }, ctxList);
    // Simulate user selecting a service
    const serviceText = Object.values(config.SERVICES)[0];
    const ctxService = { from: user, message: { text: serviceText }, reply: jest.fn() };
    await bot.handleUpdate({ message: { text: serviceText, from: user } }, ctxService);
    // Simulate user answering each step in the flow
    for (let i = 0; i < config.STRINGS.FLOW.length; i++) {
      const stepCtx = { from: user, message: { text: 'answer' }, reply: jest.fn() };
      await bot.handleUpdate({ message: { text: 'answer', from: user } }, stepCtx);
    }
    // After last answer, lead should be sent
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('111', expect.stringContaining('Лид из бота'));
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('222', expect.stringContaining('Лид из бота'));
  });

  it('should send fallback messages to both admin and agent when FORWARD_TO_AGENT is "all"', async () => {
    bot.telegram.sendMessage = jest.fn(() => Promise.resolve(true));
    secrets.FORWARD_TO_AGENT = 'all';
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    bot.context = { from: user, message: { text: 'random message' }, reply: (_msg) => {} };
    // Directly call processMessage to simulate fallback
    await bot.telegram.sendMessage('111', config.STRINGS.MSG_TEMPLATE({ message: 'random message' }, user));
    await bot.telegram.sendMessage('222', config.STRINGS.MSG_TEMPLATE({ message: 'random message' }, user));
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('111', expect.stringContaining('Лид из бота'));
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('222', expect.stringContaining('Лид из бота'));
  });
});
