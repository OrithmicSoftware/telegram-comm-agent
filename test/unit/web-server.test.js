const { createLeadWebServer } = require('../../src/server/web-server');
const request = require('supertest');

describe('createLeadWebServer', () => {
  it('throws if missing secrets', () => {
    expect(() => createLeadWebServer({})).toThrow();
  });
  it('forwards lead to both admin and agent', async () => {
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
    });
    await request(app)
      .post('/lead')
      .send({ name: 'n', phone: 'p', message: 'm' })
      .expect(200);
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('admin', expect.any(String));
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('agent', expect.any(String));
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