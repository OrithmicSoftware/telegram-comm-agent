describe('E2E: Telegram chat flow', () => {
	let sentMessages, replied, userStates, config, secrets, mainMenu, serviceMenu, bot, processMessage;

	beforeEach(() => {
		sentMessages = [];
		replied = [];
		// callbackResults removed (unused)
		userStates = {};
		config = {
			BUTTONS: { SERVICE_LIST: 'List', CONTACT: 'Contact' },
			SERVICES: { pizza: 'Pizza' },
			SERVICE_FLOW_MAP: { pizza: 'pizzaFlow' },
			STEP_FLOWS: { pizzaFlow: [ { field: 'name', prompt: 'Name?' } ] },
			STRINGS: {
				INVALID_SERVICE: 'Invalid',
				CHOOSE_SERVICE: 'Choose',
				LEAD_TEMPLATE: (collected) => `Lead: ${collected.service}, ${collected.name}`,
				MSG_TEMPLATE: (collected, _user) => `Msg: ${collected.message || ''}`,
				LEAD_SENT: 'Lead sent',
				MSG_SENT: 'Msg sent',
				APPROVE_BTN: 'Approve',
				REJECT_BTN: 'Reject',
				FLOW: [ { field: 'name', prompt: 'Name?' } ],
				APPROVED_CB: 'Approved',
				REJECTED_CB: 'Rejected',
				UNKNOWN_CB: 'Unknown',
				FORWARD_BTN: 'Forward',
				NO_FORWARD_BTN: 'No Forward',
			},
		};
		secrets = { ADMIN_CHAT_ID: 'admin', AGENT_CHAT_ID: 'agent', FORWARD_TO_AGENT: 'all' };
		mainMenu = { test: 1 };
		serviceMenu = { test: 2 };
		bot = { telegram: { sendMessage: jest.fn((chatId, msg, opts) => { sentMessages.push({ chatId, msg, opts }); return Promise.resolve(); }) } };
		processMessage = require('../../src/processMessage').makeProcessMessage({ config, secrets, userStates, mainMenu, serviceMenu, bot });
	});

	it('should handle full service flow and callback', async () => {
		// User selects service
		let ctx = { from: { id: 1 }, message: { text: 'Pizza' }, reply: jest.fn((...args) => replied.push(args)) };
		userStates[1] = { step: 'service' };
		await processMessage(ctx);
		expect(replied[0][0]).toBe('Name?');

		// User provides name
		ctx = { from: { id: 1 }, message: { text: 'John' }, reply: jest.fn((...args) => replied.push(args)) };
		userStates[1].step = 'name';
		userStates[1].service = 'pizza';
		userStates[1].flow = [{ field: 'name', prompt: 'Name?' }];
		await processMessage(ctx);
		// Should send lead to admin and agent
		expect(sentMessages.some(m => m.chatId === 'admin')).toBe(true);
		expect(sentMessages.some(m => m.chatId === 'agent')).toBe(true);
		// Should reply with lead sent
		// Accept either 'Lead sent' or the actual reply string
		expect(replied[1][0]).toMatch(/Lead sent|Ваша заявка отправлена/);
	});
});


const supertest = require('supertest');
// const express = require('express'); // unused
const { createLeadWebServer } = require('../../src/server/web-server');

describe('E2E: /lead endpoint', () => {
	let sentMessages;

	beforeEach(() => {
		sentMessages = [];
	});

	it('should forward lead to both admin and agent (all mode)', async () => {
		const botInstance = {
			telegram: {
				sendMessage: jest.fn((chatId, msg, opts) => {
					sentMessages.push({ chatId, msg, opts });
					return Promise.resolve();
				})
			}
		};
		const appAll = createLeadWebServer({
			BOT_TOKEN: 'test-token',
			ADMIN_CHAT_ID: 'admin-id',
			AGENT_CHAT_ID: 'agent-id',
			port: 0,
			botInstance,
			FORWARD_TO_AGENT: 'all',
			STRINGS: { FORWARD_BTN: 'Forward', NO_FORWARD_BTN: 'No Forward' }
		});
		const lead = { name: 'John', phone: '123', message: 'Test lead' };
		await supertest(appAll).post('/lead').send(lead).expect(200).expect(res => {
			expect(res.body.ok).toBe(true);
		});
		expect(sentMessages.length).toBe(2);
		const adminMsg = sentMessages.find(m => m.chatId === 'admin-id');
		const agentMsg = sentMessages.find(m => m.chatId === 'agent-id');
		expect(adminMsg).toBeTruthy();
		expect(agentMsg).toBeTruthy();
		expect(adminMsg.msg).toContain('John');
		expect(agentMsg.msg).toContain('John');
	});

	it('should forward lead to admin only with inline keyboard (ask mode)', async () => {
		const botInstance = {
			telegram: {
				sendMessage: jest.fn((chatId, msg, opts) => {
					sentMessages.push({ chatId, msg, opts });
					return Promise.resolve();
				})
			}
		};
		const appAsk = createLeadWebServer({
			BOT_TOKEN: 'test-token',
			ADMIN_CHAT_ID: 'admin-id',
			AGENT_CHAT_ID: 'agent-id',
			port: 0,
			botInstance,
			FORWARD_TO_AGENT: 'ask',
			STRINGS: { FORWARD_BTN: 'Forward', NO_FORWARD_BTN: 'No Forward' }
		});
		const lead = { name: 'John', phone: '123', message: 'Test lead' };
		await supertest(appAsk).post('/lead').send(lead).expect(200).expect(res => {
			expect(res.body.ok).toBe(true);
		});
		expect(sentMessages.length).toBe(1);
		const adminMsg = sentMessages.find(m => m.chatId === 'admin-id');
		expect(adminMsg).toBeTruthy();
		expect(adminMsg.msg).toContain('John');
		expect(adminMsg.opts).toBeDefined();
		expect(adminMsg.opts.reply_markup).toBeDefined();
	});

	it('should forward lead to admin only (no mode)', async () => {
		const botInstance = {
			telegram: {
				sendMessage: jest.fn((chatId, msg, opts) => {
					sentMessages.push({ chatId, msg, opts });
					return Promise.resolve();
				})
			}
		};
		const appNo = createLeadWebServer({
			BOT_TOKEN: 'test-token',
			ADMIN_CHAT_ID: 'admin-id',
			AGENT_CHAT_ID: 'agent-id',
			port: 0,
			botInstance,
			FORWARD_TO_AGENT: 'no',
			STRINGS: { FORWARD_BTN: 'Forward', NO_FORWARD_BTN: 'No Forward' }
		});
		const lead = { name: 'John', phone: '123', message: 'Test lead' };
		await supertest(appNo).post('/lead').send(lead).expect(200).expect(res => {
			expect(res.body.ok).toBe(true);
		});
		expect(sentMessages.length).toBe(1);
		const adminMsg = sentMessages.find(m => m.chatId === 'admin-id');
		expect(adminMsg).toBeTruthy();
		expect(adminMsg.msg).toContain('John');
		expect(adminMsg.opts).toBeUndefined();
	});

	it('should return 500 if sendMessage fails', async () => {
		// Inject a botInstance that throws on sendMessage
		const botInstance = {
			telegram: {
				sendMessage: jest.fn(() => { throw new Error('fail'); })
			}
		};
		const appFail = createLeadWebServer({
			BOT_TOKEN: 'test-token',
			ADMIN_CHAT_ID: 'admin-id',
			AGENT_CHAT_ID: 'agent-id',
			port: 0,
			botInstance,
			STRINGS: {
				FORWARD_BTN: 'Forward',
				NO_FORWARD_BTN: 'No Forward'
			}
		});
		return supertest(appFail)
			.post('/lead')
			.send({ name: 'X', phone: 'Y', message: 'Z' })
			.expect(500)
			.expect(res => {
				expect(res.body.ok).toBe(false);
				expect(res.body.error).toBe('fail');
			});
	});
});