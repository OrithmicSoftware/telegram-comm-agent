const handleLeadForwarding = require('../src/handleLeadForwarding');

describe('handleLeadForwarding', () => {
  let bot;
  beforeEach(() => {
    bot = { telegram: { sendMessage: jest.fn() } };
  });
  const config = {
    ADMIN_CHAT_ID: 'admin',
    AGENT_CHAT_ID: 'agent',
    FORWARD_TO_AGENT: 'all',
    STRINGS: {
      FORWARD_BTN: 'Forward',
      NO_FORWARD_BTN: 'No',
    },
  };
  it('forwards to both admin and agent if FORWARD_TO_AGENT is all', async () => {
    await handleLeadForwarding(bot, config, 'lead', {});
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'lead');
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('agent', 'lead');
  });
  it('forwards only to admin if FORWARD_TO_AGENT is no', async () => {
    await handleLeadForwarding(bot, { ...config, FORWARD_TO_AGENT: 'no' }, 'lead', {});
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'lead');
    expect(bot.telegram.sendMessage).toHaveBeenCalledTimes(1);
  });
  it('sends inline buttons if FORWARD_TO_AGENT is ask', async () => {
    await handleLeadForwarding(bot, { ...config, FORWARD_TO_AGENT: 'ask' }, 'lead', {});
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
      'admin',
      'lead',
      expect.objectContaining({ reply_markup: expect.any(Object) })
    );
  });
});
