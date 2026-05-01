const { createLeadWebServer } = require('../../src/server/web-server');
const request = require('supertest');

describe('createLeadWebServer', () => {
  it('throws if missing secrets', () => {
    expect(() => createLeadWebServer({})).toThrow();
  });

  it('forwards lead to both admin and agent (all mode)', async () => {
    const botInstance = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue(true),
      },
    };
    const app = createLeadWebServer({
      BOT_TOKEN: 'token',
      ADMIN_CHAT_ID: 'admin',
      AGENT_CHAT_ID: 'agent',
      botInstance,
      port: 0,
      FORWARD_TO_AGENT: 'all',
      STRINGS: {
        FORWARD_BTN: 'Forward',
        NO_FORWARD_BTN: 'No Forward'
      }
    });
    await request(app)
      .post('/lead')
      .send({ name: 'n', phone: 'p', message: 'm' })
      .expect(200);
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('admin', expect.any(String));
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('agent', expect.any(String));
  });

  it('forwards lead to admin only with inline keyboard (ask mode)', async () => {
    const botInstance = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue(true),
      },
    };
    const app = createLeadWebServer({
      BOT_TOKEN: 'token',
      ADMIN_CHAT_ID: 'admin',
      AGENT_CHAT_ID: 'agent',
      botInstance,
      port: 0,
      FORWARD_TO_AGENT: 'ask',
      STRINGS: {
        FORWARD_BTN: 'Forward',
        NO_FORWARD_BTN: 'No Forward'
      }
    });
    await request(app)
      .post('/lead')
      .send({ name: 'n', phone: 'p', message: 'm' })
      .expect(200);
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith(
      'admin',
      expect.any(String),
      expect.objectContaining({ reply_markup: expect.any(Object) })
    );
    expect(botInstance.telegram.sendMessage).not.toHaveBeenCalledWith('agent', expect.anything());
  });

  it('forwards lead to admin only (no mode)', async () => {
    const botInstance = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue(true),
      },
    };
    const app = createLeadWebServer({
      BOT_TOKEN: 'token',
      ADMIN_CHAT_ID: 'admin',
      AGENT_CHAT_ID: 'agent',
      botInstance,
      port: 0,
      FORWARD_TO_AGENT: 'no',
      STRINGS: {
        FORWARD_BTN: 'Forward',
        NO_FORWARD_BTN: 'No Forward'
      }
    });
    await request(app)
      .post('/lead')
      .send({ name: 'n', phone: 'p', message: 'm' })
      .expect(200);
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('admin', expect.any(String));
    expect(botInstance.telegram.sendMessage).not.toHaveBeenCalledWith('agent', expect.anything());
  });
  it('should reject missing or empty fields', async () => {
    const botInstance = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue(true),
      },
    };
    const app = createLeadWebServer({
      BOT_TOKEN: 'token',
      ADMIN_CHAT_ID: 'admin',
      AGENT_CHAT_ID: 'agent',
      botInstance,
      port: 0,
      STRINGS: {
        FORWARD_BTN: 'Forward',
        NO_FORWARD_BTN: 'No Forward'
      }
    });
    const invalidLeads = [
      {},
      { name: '', phone: '123', message: 'msg' },
      { name: 'n', phone: '', message: 'msg' },
      { name: 'n', phone: '123', message: '' },
      { name: ' ', phone: '123', message: 'msg' },
      { name: 'n', phone: ' ', message: 'msg' },
      { name: 'n', phone: '123', message: ' ' },
    ];
    for (const lead of invalidLeads) {
      await request(app)
        .post('/lead')
        .send(lead)
        .expect(400)
        .expect(res => {
          expect(res.body.ok).toBe(false);
          expect(res.body.error).toMatch(/missing|empty/i);
        });
    }
  });
});