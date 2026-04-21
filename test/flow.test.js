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

  it('should create a bot and walk through the FLOW prompts', async () => {
    const flow = config.STRINGS.FLOW;
    const user = { id: userId, username: 'testuser', first_name: 'Test' };
    bot.context.from = user;
    bot.context.message = { text: Object.values(config.SERVICES)[0] };
    // Simulate service selection
    // ...simulate step flow as in consumer tests...
    for (let i = 0; i < flow.length; i++) {
      bot.context.from = user;
      bot.context.message = { text: `answer${i}` };
      // Simulate generic step handler
      await bot.context.reply(flow[i].prompt);
    }
    expect(replies.map(r => r.msg)).toContain(flow[0].prompt);
    expect(replies.map(r => r.msg)).toContain(flow[1].prompt);
  });
});
