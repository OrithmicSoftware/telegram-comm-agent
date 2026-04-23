const { forwardToAdmin, forwardToAgent } = require('../../src/forward');

describe('forward', () => {
	it('forwards to admin', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		await forwardToAdmin(bot, 'admin_id', 'msg', { extra: 1 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin_id', 'msg', { extra: 1 });
	});
	it('forwards to agent', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		await forwardToAgent(bot, 'agent_id', 'msg', { extra: 2 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('agent_id', 'msg', { extra: 2 });
	});
});