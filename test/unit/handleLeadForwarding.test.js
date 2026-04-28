const handleLeadForwarding = require('../../src/handleLeadForwarding');

describe('handleLeadForwarding', () => {
	const leadText = 'Test lead';
	const baseConfig = {
		ADMIN_CHAT_ID: 'admin',
		AGENT_CHAT_ID: 'agent',
		STRINGS: {
			FORWARD_BTN: 'Forward',
			NO_FORWARD_BTN: 'No Forward'
		}
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('forwards to admin only', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		const config = { ...baseConfig, FORWARD_TO_AGENT: 'no' };
		await handleLeadForwarding(bot, config, leadText, { extra: 1 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', leadText);
		expect(bot.telegram.sendMessage).not.toHaveBeenCalledWith('agent', expect.anything());
	});

	it('forwards to both admin and agent', async () => {
		const bot = { telegram: { sendMessage: jest.fn() } };
		const config = { ...baseConfig, FORWARD_TO_AGENT: 'all' };
		await handleLeadForwarding(bot, config, leadText, { extra: 2 });
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('admin', leadText);
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith('agent', leadText);
	});

	it('sends inline keyboard with required button fields if FORWARD_TO_AGENT is "ask"', async () => {
		const bot = { telegram: { sendMessage: jest.fn().mockResolvedValue(true) } };
		const config = { ...baseConfig, FORWARD_TO_AGENT: 'ask' };
		await handleLeadForwarding(bot, config, leadText, { source: 'test' });
		const call = bot.telegram.sendMessage.mock.calls.find(c => c[0] === 'admin');
		expect(call).toBeDefined();
		const opts = call[2];
		expect(opts.reply_markup).toBeDefined();
		expect(opts.reply_markup.inline_keyboard[0][0].text).toBe('Forward');
		expect(opts.reply_markup.inline_keyboard[0][1].text).toBe('No Forward');
		expect(opts.reply_markup.inline_keyboard[0][0].callback_data).toMatch(/^forward_lead/);
		expect(opts.reply_markup.inline_keyboard[0][1].callback_data).toMatch(/^no_forward_lead/);
	});

	it('throws if FORWARD_BTN or NO_FORWARD_BTN is missing in STRINGS', async () => {
		const bot = { telegram: { sendMessage: jest.fn().mockResolvedValue(true) } };
		const config = { ...baseConfig, FORWARD_TO_AGENT: 'ask', STRINGS: {} };
		await expect(handleLeadForwarding(bot, config, leadText, { source: 'test' }))
			.rejects.toThrow();
	});
});