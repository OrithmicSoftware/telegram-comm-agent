const { makeProcessMessage } = require('../../src/processMessage');

describe('makeProcessMessage', () => {
	let config, secrets, userStates, mainMenu, serviceMenu, bot;
	beforeEach(() => {
		config = {
			BUTTONS: { SERVICE_LIST: 'List', CONTACT: 'Contact' },
			SERVICES: { pizza: 'Pizza' },
			SERVICE_FLOW_MAP: { pizza: 'pizzaFlow' },
			STEP_FLOWS: { pizzaFlow: [ { field: 'name', prompt: 'Name?' } ] },
			STRINGS: {
				INVALID_SERVICE: 'Invalid',
				CHOOSE_SERVICE: 'Choose',
				LEAD_TEMPLATE: (collected) => `Lead: ${collected.service}, ${collected.name}`,
				MSG_TEMPLATE: (_user, text) => `Msg: ${text}`,
				LEAD_SENT: 'Lead sent',
				MSG_SENT: 'Msg sent',
				APPROVE_BTN: 'Approve',
				REJECT_BTN: 'Reject',
				FLOW: [ { field: 'name', prompt: 'Name?' } ],
			},
		};
		secrets = { ADMIN_CHAT_ID: 'admin', AGENT_CHAT_ID: 'agent', FORWARD_TO_AGENT: 'all' };
		userStates = {};
		mainMenu = { test: 1 };
		serviceMenu = { test: 2 };
		bot = { telegram: { sendMessage: jest.fn() } };
	});
	it('handles invalid service', async () => {
		const processMessage = makeProcessMessage({ config, secrets, userStates, mainMenu, serviceMenu, bot });
		const ctx = { from: { id: 1 }, message: { text: 'NotAService' }, reply: jest.fn() };
		userStates[1] = { step: 'service' };
		await processMessage(ctx);
		expect(ctx.reply).toHaveBeenCalledWith('Invalid', serviceMenu);
	});
	it('handles fallback', async () => {
		const processMessage = makeProcessMessage({ config, secrets, userStates, mainMenu, serviceMenu, bot });
		const ctx = { from: { id: 2 }, message: { text: 'random' }, reply: jest.fn() };
		await processMessage(ctx);
		expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
			'admin',
			expect.stringContaining('Msg:'),
			expect.objectContaining({ reply_markup: expect.any(Object) })
		);
		expect(ctx.reply).toHaveBeenCalledWith('Msg sent', mainMenu);
	});
});