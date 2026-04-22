const { forwardMessage } = require('../src/forward');

describe('forwardMessage', () => {
  let bot;
  beforeEach(() => {
    bot = { telegram: { sendMessage: jest.fn() } };
  });
  const secrets = { ADMIN_CHAT_ID: 'admin', AGENT_CHAT_ID: 'agent' };
  it('forwards to both admin and agent if FORWARD_TO_AGENT is all', async () => {
    await forwardMessage(bot, { FORWARD_TO_AGENT: 'all' }, secrets, 'msg', { test: 1 });
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'msg', { test: 1 });
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('agent', 'msg', { test: 1 });
  });
  it('forwards only to admin if FORWARD_TO_AGENT is no', async () => {
    await forwardMessage(bot, { FORWARD_TO_AGENT: 'no' }, secrets, 'msg', { test: 2 });
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'msg', { test: 2 });
    expect(bot.telegram.sendMessage).toHaveBeenCalledTimes(1);
  });
});
