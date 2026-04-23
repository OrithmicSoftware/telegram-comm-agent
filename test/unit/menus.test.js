const { buildMainMenu, buildServiceMenu } = require('../../src/menus');

describe('menus', () => {
	const config = {
		BUTTONS: { SERVICE_LIST: 'List', CONTACT: 'Contact' },
		SERVICES: { pizza: 'Pizza', car: 'Car' },
	};

	it('builds main menu', () => {
		const menu = buildMainMenu(config);
		expect(menu).toEqual({
			reply_markup: {
				keyboard: [['List', 'Contact']],
				resize_keyboard: true,
				one_time_keyboard: false,
			},
		});
	});

	it('builds service menu', () => {
		const menu = buildServiceMenu(config);
		expect(menu).toEqual({
			reply_markup: {
				keyboard: [['Pizza'], ['Car']],
				resize_keyboard: true,
				one_time_keyboard: true,
			},
		});
	});
});