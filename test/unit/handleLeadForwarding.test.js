const handleLeadForwarding = require('../../src/handleLeadForwarding');

describe('handleLeadForwarding', () => {
	it('forwards to admin only', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		const config = { FORWARD_TO_AGENT: 'no', ADMIN_CHAT_ID: 'admin', AGENT_CHAT_ID: 'agent' };
		await handleLeadForwarding(bot, config, 'msg', { extra: 1 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'msg');
		expect(bot.telegram.sendMessage).not.toHaveBeenCalledWith('agent', expect.anything());
	});
	it('forwards to both admin and agent', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		const config = { FORWARD_TO_AGENT: 'all', ADMIN_CHAT_ID: 'admin', AGENT_CHAT_ID: 'agent' };
		await handleLeadForwarding(bot, config, 'msg', { extra: 2 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', 'msg');
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('agent', 'msg');
	});
});